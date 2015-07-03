class InstanceUsersChangeUserIdUnique < ActiveRecord::Migration
  def change
    remove_index :instance_users, :user_id
  end
end
