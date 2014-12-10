class InstanceUser < ActiveRecord::Base
  acts_as_tenant :instance

  #TODO schema_validation gem has some issues when working with enum
  #enum role: { admin: 0, instructor: 1, normal: 2 }
  belongs_to :instance
  belongs_to :user
end
