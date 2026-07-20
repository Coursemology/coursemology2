# frozen_string_literal: true
# Answers "if I add this rule, who gets access?" for a rule that has not been saved, so the admin
# sees the effect before committing. Persists nothing.
class Course::Assessment::Marketplace::RulePreviewQuery
  AccessBlock = Course::Assessment::Marketplace::AccessBlock
  AccessListQuery = Course::Assessment::Marketplace::AccessListQuery
  RuleMatchQuery = Course::Assessment::Marketplace::RuleMatchQuery

  Row = Struct.new(:user, :course_count, :instance_role, :already_has_access, :blocked,
                   keyword_init: true)

  # @param [Course::Assessment::Marketplace::AllowlistRule] rule an unsaved, valid rule
  def initialize(rule)
    @rule = rule
    @access_list = AccessListQuery.new
  end

  # @return [Array<Row>]
  def rows
    # Blocked first, then already-has-access, then the newly granted, each group still by name: a
    # rule can match hundreds, and the people this rule does NOT newly reach are the only reason to
    # read the list at all — buried on page 14 of an alphabetical list they may as well not be
    # shown. A stable sort_by on the group rank alone, so the name order the database chose
    # survives inside each group.
    @rows ||= annotate(matched_users.to_a).
              each_with_index.sort_by { |row, index| [group_rank(row), index] }.map(&:first)
  end

  # @return [Hash]
  def summary
    {
      matched_count: rows.size,
      # A rule grants nothing to someone another rule already clears, and nothing at all to a
      # blocked user — adding a rule does not unblock anyone.
      new_count: rows.count { |row| !row.already_has_access && !row.blocked },
      blocked_count: rows.count(&:blocked),
      open_to_everyone: @access_list.summary[:open_to_everyone]
    }
  end

  private

  # Same precedence as the row's status marker, which shows Blocked over already-has-access.
  def group_rank(row)
    return 0 if row.blocked
    return 1 if row.already_has_access

    2
  end

  def matched_ids
    @matched_ids ||= RuleMatchQuery.new(@rule).user_ids_within(baseline_ids)
  end

  # Only baseline-eligible staff can ever reach the marketplace, so a rule matching anyone else
  # grants nothing and must not be counted.
  def baseline_ids
    @baseline_ids ||= User.where(id: CourseUser.managers.select(:user_id)).
                      or(User.where(id: instance_staff_scope.select(:user_id))).pluck(:id)
  end

  def instance_staff_scope
    InstanceUser.unscoped.where(role: [:instructor, :administrator])
  end

  def matched_users
    User.where(id: matched_ids.to_a).includes(:emails).order(:name)
  end

  def annotate(users)
    ids = users.map(&:id)
    counts = CourseUser.managers.where(user_id: ids).group(:user_id).count
    staff = instance_staff_roles(ids)
    allowed = @access_list.allowed_user_ids
    blocked = AccessBlock.where(user_id: ids).pluck(:user_id).to_set

    users.map { |user| build_row(user, counts, staff, allowed, blocked) }
  end

  def build_row(user, counts, staff, allowed, blocked)
    Row.new(user: user, course_count: counts[user.id] || 0, instance_role: staff[user.id],
            already_has_access: allowed.include?(user.id), blocked: blocked.include?(user.id))
  end

  def instance_staff_roles(ids)
    InstanceUser.unscoped.where(user_id: ids, role: [:instructor, :administrator]).
      group(:user_id).maximum(:role).
      transform_values { |role| InstanceUser.roles.key(role) }
  end
end
