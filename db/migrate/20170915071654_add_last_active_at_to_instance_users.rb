class AddLastActiveAtToInstanceUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :instance_users, :last_active_at, :datetime
  end
end
