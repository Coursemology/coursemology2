class AddRoleToUsers < ActiveRecord::Migration
  def change
    add_column :users, :role, :integer, null: false, default: 1
  end
end
