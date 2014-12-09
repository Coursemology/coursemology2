class InstanceUser < ActiveRecord::Base
  acts_as_tenant :instance

  belongs_to :instance
  belongs_to :user
end
