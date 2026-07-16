# frozen_string_literal: true
class Course::Assessment::Marketplace::AllowlistRule < ApplicationRecord
  enum :rule_type, { user: 0, instance: 1, email_domain: 2 }, prefix: true

  belongs_to :user, class_name: 'User', inverse_of: false, optional: true
  belongs_to :instance, inverse_of: false, optional: true

  validates :user, presence: true, if: :rule_type_user?
  validates :instance, presence: true, if: :rule_type_instance?
  validates :email_domain, presence: true, if: :rule_type_email_domain?

  # Whether the marketplace is visible to +user+ per the allow-list. The rules table itself is
  # global (not tenant-scoped), but `user.instance_users` IS tenant-scoped (acts_as_tenant), so
  # in a request an `instance` rule matches only while browsing the allow-listed instance —
  # it grants that instance's users access *there*, not membership-based access everywhere.
  # @param [User] user
  # @return [Boolean]
  def self.grants_access?(user)
    return false unless user

    rule_type_user.where(user_id: user.id).exists? ||
      rule_type_instance.where(instance_id: user.instance_users.select(:instance_id)).exists? ||
      email_domain_matches?(user)
  end

  # @param [User] user
  # @return [Boolean]
  def self.email_domain_matches?(user)
    domains = user.emails.pluck(:email).filter_map { |e| e.split('@').last&.downcase }.uniq
    return false if domains.empty?

    rule_type_email_domain.where('LOWER(email_domain) IN (?)', domains).exists?
  end
end
