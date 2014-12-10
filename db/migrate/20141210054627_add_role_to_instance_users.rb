class AddRoleToInstanceUsers < ActiveRecord::Migration
  def change
    add_column :instance_users, :role, :integer, default: 0, null: false, index: true
  end
end
