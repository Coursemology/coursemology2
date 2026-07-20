# frozen_string_literal: true
# Which baseline-eligible users does a single allow-list rule match? The rule may be unsaved, so the
# admin can preview a rule's effect before adding it. This is the one place that knows each rule
# type's matching semantics; AccessListQuery and the preview endpoint both go through it.
#
# Deliberately NOT the same as AllowlistRule.grants_access?, which reads the tenant-scoped
# `user.instance_users` at request time. Here `instance` rules match globally via
# InstanceUser.unscoped, because the audit list is not browsing any one instance.
class Course::Assessment::Marketplace::RuleMatchQuery
  # @param [Course::Assessment::Marketplace::AllowlistRule] rule persisted or in-memory
  def initialize(rule)
    @rule = rule
  end

  # @param [Array<Integer>] candidate_user_ids the users to test
  # @return [Set<Integer>] the subset of +candidate_user_ids+ this rule matches
  def user_ids_within(candidate_user_ids)
    return Set.new if candidate_user_ids.empty?

    case @rule.rule_type
    when 'everyone' then candidate_user_ids.to_set
    when 'user' then matched_user(candidate_user_ids)
    when 'instance' then matched_instance_members(candidate_user_ids)
    when 'email_domain' then matched_domain_holders(candidate_user_ids)
    else Set.new
    end
  end

  private

  def matched_user(ids)
    (@rule.user_id.present? && ids.include?(@rule.user_id)) ? Set[@rule.user_id] : Set.new
  end

  def matched_instance_members(ids)
    return Set.new if @rule.instance_id.blank?

    InstanceUser.unscoped.where(user_id: ids, instance_id: @rule.instance_id).
      pluck(:user_id).to_set
  end

  def matched_domain_holders(ids)
    domain = @rule.email_domain&.strip&.downcase
    return Set.new if domain.blank?

    User::Email.where.not(confirmed_at: nil).where(user_id: ids).
      where('LOWER(SPLIT_PART(email, ?, 2)) = ?', '@', domain).
      pluck(:user_id).to_set
  end
end
