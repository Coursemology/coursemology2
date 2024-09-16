# frozen_string_literal: true
class Instance::UserRoleRequest < ApplicationRecord
  include Workflow
  enum :role, InstanceUser.roles.except(:normal)

  after_initialize :set_default_role, if: :new_record?

  workflow do
    state :pending do
      event :approve, transitions_to: :approved
      event :reject, transitions_to: :rejected
    end
    state :approved
    state :rejected
  end

  validates :role, presence: true
  validates :organization, length: { maximum: 255 }, allow_nil: true
  validates :designation, length: { maximum: 255 }, allow_nil: true
  validates :instance, presence: true
  validates :user, presence: true
  validates :workflow_state, length: { maximum: 255 }, presence: true
  validate :validate_no_duplicate_pending_request, on: :create

  belongs_to :instance, inverse_of: :user_role_requests
  belongs_to :user, inverse_of: nil
  belongs_to :confirmer, class_name: 'User', inverse_of: nil, optional: true

  alias_method :approve=, :approve!
  alias_method :reject=, :reject!

  scope :pending, -> { where(workflow_state: :pending) }

  def send_new_request_email(instance)
    ActsAsTenant.without_tenant do
      admins = instance.instance_users.administrator.map(&:user).to_set

      # Also send emails to global admins if it's default instance.
      admins += User.administrator if instance.default? || admins.empty?

      admins.each do |admin|
        InstanceUserRoleRequestMailer.new_role_request(self, admin).deliver_later
      end
    end
  end

  private

  def validate_no_duplicate_pending_request
    existing_request = Instance::UserRoleRequest.find_by(user_id: user_id, workflow_state: 'pending')
    errors.add(:base, :existing_pending_request) if existing_request
  end

  def set_default_role
    self.role ||= :instructor
  end

  def approve(_ = nil)
    self.confirmed_at = Time.zone.now
    self.confirmer = User.stamper

    instance_user = InstanceUser.find_or_initialize_by(instance_id: instance_id, user_id: user_id)
    instance_user.role = role

    success = self.class.transaction do
      raise ActiveRecord::Rollback unless instance_user.save

      true
    end
    [success, instance_user]
  end

  def reject(_ = nil)
    self.confirmed_at = Time.zone.now
    self.confirmer = User.stamper
  end
end
