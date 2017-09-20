# frozen_string_literal: true
class Instance::UserRoleRequest < ApplicationRecord
  enum role: InstanceUser.roles.except(:normal)

  after_initialize :set_default_role, if: :new_record?

  belongs_to :instance, inverse_of: :user_role_requests
  belongs_to :user, inverse_of: nil

  # Set the corresponding instance user to the requested role and destroy the request.
  #
  # @return [Array(Boolean, InstanceUser)] returns success status and the updated instance user.
  def approve_and_destroy!
    instance_user = InstanceUser.find_or_initialize_by(user_id: user_id)
    instance_user.role = role
    success = self.class.transaction do
      raise ActiveRecord::Rollback unless instance_user.save && destroy
      true
    end

    [success, instance_user]
  end

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

  def set_default_role
    self.role ||= :instructor
  end
end
