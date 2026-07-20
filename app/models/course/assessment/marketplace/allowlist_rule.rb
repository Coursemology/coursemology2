# frozen_string_literal: true
class Course::Assessment::Marketplace::AllowlistRule < ApplicationRecord
  enum :rule_type,
       { user: 0, instance: 1, email_domain: 2, everyone: 3 },
       prefix: true

  belongs_to :user, class_name: 'User', inverse_of: false, optional: true
  belongs_to :instance, inverse_of: false, optional: true

  # Transient: the admin form identifies a `user` rule by email (user IDs are not shown anywhere
  # in the admin panel). Resolved to the owning user before validation; the stored row keeps the
  # `user_id` FK, so the rule means "this person" even if they later change email.
  attr_accessor :email

  before_validation :resolve_user_from_email, if: -> { rule_type_user? && email.present? }

  # When an email was supplied, `resolve_user_from_email` reports its own failure; skip the generic
  # presence check in that path so the message is exactly "No user with that email." (not a pair).
  before_validation :normalize_email_domain, if: :rule_type_email_domain?

  validates :user, presence: true, if: -> { rule_type_user? && email.blank? }
  validates :instance, presence: true, if: :rule_type_instance?
  validates :email_domain, presence: true, if: :rule_type_email_domain?

  # Identical rules grant nothing extra and make the rules table unreadable. Each is paired with a
  # partial unique index. `scope: :rule_type` matters on the unresolved-email path: a user rule
  # whose email matched nobody keeps user_id NULL, and Rails checks that as `user_id IS NULL`,
  # which matches every instance and email-domain rule — reporting a bogus duplicate on top of the
  # real "No user with that email." Scoping confines the check to rules of the same type.
  validates :user_id, uniqueness: { scope: :rule_type, message: 'already has a rule.' },
                      if: :rule_type_user?
  validates :instance_id, uniqueness: { scope: :rule_type, message: 'already has a rule.' },
                          if: :rule_type_instance?
  validates :email_domain, uniqueness: { scope: :rule_type, message: 'already has a rule.' },
                           if: :rule_type_email_domain?
  # "Everyone" is the widest rule; only one may exist. Paired with a partial unique index.
  validates :rule_type, uniqueness: true, if: :rule_type_everyone?

  # Whether the marketplace is visible to +user+ per the allow-list. The rules table itself is
  # global (not tenant-scoped), but `user.instance_users` IS tenant-scoped (acts_as_tenant), so
  # in a request an `instance` rule matches only while browsing the allow-listed instance —
  # it grants that instance's users access *there*, not membership-based access everywhere.
  # An `everyone` rule grants every authenticated user (the `nil` guard still excludes anonymous).
  # Baseline (manager/owner OR instructor/admin) is checked separately in the ability component.
  # @param [User] user
  # @return [Boolean]
  def self.grants_access?(user)
    return false unless user

    rule_type_everyone.exists? ||
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

  private

  # Matching is case-insensitive everywhere, so the stored form is normalized on write. This keeps
  # the uniqueness index a plain column comparison instead of a functional LOWER() index.
  def normalize_email_domain
    self.email_domain = email_domain&.strip&.downcase
  end

  def resolve_user_from_email
    self.user = User.with_email_addresses([email.strip.downcase]).first
    errors.add(:base, 'No user with that email.') if user.nil?
  end
end
