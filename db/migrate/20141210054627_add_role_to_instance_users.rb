class AddRoleToInstanceUsers < ActiveRecord::Migration
  def change
    add_column :instance_users, :role, :integer, default: 3, null: false, index: true
  end
end
