class AddLastActiveAtToInstanceUsers < ActiveRecord::Migration
  def change
    add_column :instance_users, :last_active_at, :datetime
  end
end
