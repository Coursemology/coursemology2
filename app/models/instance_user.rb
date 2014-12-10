class InstanceUser < ActiveRecord::Base
  acts_as_tenant :instance

  enum role: { admin: 0, instructor: 1, normal: 2 }
  belongs_to :instance
  belongs_to :user
end
