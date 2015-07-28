class InstanceUser < ActiveRecord::Base
  acts_as_tenant :instance, inverse_of: :instance_users

  enum role: { normal: 0, instructor: 1, administrator: 2 }
  belongs_to :user, inverse_of: :instance_users
end
