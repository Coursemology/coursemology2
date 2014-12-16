class AddRoleToUsersAndInstanceUsers < ActiveRecord::Migration
  def change
    add_column :users, :role, :integer, default: 0, null: false
    add_column :instance_users, :role, :integer, default: 0, null: false
  end
end
