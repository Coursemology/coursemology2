# frozen_string_literal: true
# Computes the marketplace access audit list: every user who is baseline-capable (manages/owns >=1
# course, OR is an instructor/administrator in any instance) AND cleared by the allow-list, PLUS
# every individually blocked user regardless of rule match — an orphaned block must stay visible and
# clearable. Blocked users are INCLUDED and flagged. Not paginated server-side - the eligible set is
# bounded (managers + instance staff) and the frontend paginates/searches client-side, matching the
# rules page which also fetches its whole list at once.
class Course::Assessment::Marketplace::AccessListQuery
  AllowlistRule = Course::Assessment::Marketplace::AllowlistRule
  AccessBlock = Course::Assessment::Marketplace::AccessBlock
  RuleMatchQuery = Course::Assessment::Marketplace::RuleMatchQuery

  # `allowed_by_rules` holds EVERY rule matching the user, not one precedence winner: the admin uses
  # it to answer "if I delete this rule, who loses access?", and one reason answers that wrongly.
  Row = Struct.new(:user, :course_count, :instance_role, :allowed_by_rules, :block_id,
                   :system_admin, keyword_init: true) do
    def blocked?
      block_id.present?
    end

    def system_admin?
      system_admin.present?
    end
  end

  # @return [Array<Row>]
  def rows
    @rows ||= annotate(listed_users.to_a)
  end

  # @return [Hash]
  def summary
    {
      total_with_access: rows.count { |row| !row.blocked? },
      total_blocked: rows.count(&:blocked?),
      open_to_everyone: everyone?
    }
  end

  # Baseline-eligible users the allow-list currently clears. A block does not remove someone from
  # this set — being blocked is a separate decision layered on top of being allowed.
  # @return [Set<Integer>]
  def allowed_user_ids
    # System admins hold a blanket `can :manage, :all`, so they have the marketplace whatever the
    # rules say. This table is the audit source of truth, so they are always in it — omitting them
    # would show an admin as having no access while they in fact bypass every gate.
    @allowed_user_ids ||= (everyone? ? baseline_ids.to_set : rules_by_user.keys.to_set) | admin_ids
  end

  private

  # Batches every per-user annotation into one query each, keyed by user id.
  def annotate(users)
    ids = users.map(&:id)
    counts = managed_course_counts(ids)
    staff = instance_staff_roles(ids)
    block_ids = block_ids_by_user(ids)

    users.map do |user|
      Row.new(user: user, course_count: counts[user.id] || 0,
              instance_role: staff[user.id], allowed_by_rules: rules_by_user[user.id] || [],
              block_id: block_ids[user.id], system_admin: admin_ids.include?(user.id))
    end
  end

  def managed_course_counts(ids)
    CourseUser.managers.where(user_id: ids).group(:user_id).count
  end

  def block_ids_by_user(ids)
    AccessBlock.where(user_id: ids).pluck(:user_id, :id).to_h
  end

  def blocked_ids
    @blocked_ids ||= AccessBlock.pluck(:user_id).to_set
  end

  def listed_users
    User.where(id: (allowed_user_ids | blocked_ids).to_a).includes(:emails).order(:name)
  end

  def admin_ids
    @admin_ids ||= User.administrator.pluck(:id).to_set
  end

  def baseline_ids
    @baseline_ids ||= baseline_scope.pluck(:id)
  end

  # CourseUser is not tenant-scoped ("any course"); InstanceUser IS, so .unscoped for "any instance".
  def baseline_scope
    User.where(id: CourseUser.managers.select(:user_id)).
      or(User.where(id: instance_staff_scope.select(:user_id))).
      or(User.administrator)
  end

  def instance_staff_scope
    InstanceUser.unscoped.where(role: [:instructor, :administrator])
  end

  def everyone?
    return @everyone if defined?(@everyone)

    @everyone = AllowlistRule.rule_type_everyone.exists?
  end

  # An `everyone` rule is a page-level mode, not a per-row reason, so it contributes no scoped rules.
  def scoped_rules
    @scoped_rules ||= if everyone?
                        []
                      else
                        # `user`/`instance` are read when labelling each row's reasons; preload them
                        # once here rather than once per rule per row.
                        AllowlistRule.where.not(rule_type: :everyone).
                          includes(:user, :instance).order(:id).to_a
                      end
  end

  # user id => [AllowlistRule], every rule matching that user, in rules-table order.
  def rules_by_user
    @rules_by_user ||= scoped_rules.each_with_object({}) do |rule, map|
      RuleMatchQuery.new(rule).user_ids_within(baseline_ids).each do |id|
        (map[id] ||= []) << rule
      end
    end
  end

  def instance_staff_roles(ids)
    InstanceUser.unscoped.where(user_id: ids, role: [:instructor, :administrator]).
      group(:user_id).maximum(:role).
      transform_values { |role| InstanceUser.roles.key(role) }
  end
end
