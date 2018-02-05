# frozen_string_literal: true
class InstanceUsersChangeUserIdUnique < ActiveRecord::Migration[4.2]
  def change
    remove_index :instance_users, :user_id
  end
end
