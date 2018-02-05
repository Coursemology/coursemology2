# frozen_string_literal: true
class AddRoleToUsersAndInstanceUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :role, :integer, default: 0, null: false
    add_column :instance_users, :role, :integer, default: 0, null: false
  end
end
