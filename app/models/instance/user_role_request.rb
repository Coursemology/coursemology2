# frozen_string_literal: true
class Instance::UserRoleRequest < ActiveRecord::Base
  enum role: InstanceUser.roles.except(:normal)

  after_initialize :set_default_role, if: :new_record?

  belongs_to :instance, inverse_of: :user_role_requests
  belongs_to :user, inverse_of: nil

  private

  def set_default_role
    self.role ||= :instructor
  end
end
