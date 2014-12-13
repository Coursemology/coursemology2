class InstanceUser < ActiveRecord::Base
  acts_as_tenant :instance

  enum role: { normal: 0, instructor: 1, administartor: 2 }
  belongs_to :instance
  belongs_to :user
end
