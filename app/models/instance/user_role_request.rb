# frozen_string_literal: true
class Instance::UserRoleRequest < ActiveRecord::Base
  enum role: InstanceUser.roles.except(:normal)

  belongs_to :instance, inverse_of: :user_role_requests
  belongs_to :user, inverse_of: nil
end
