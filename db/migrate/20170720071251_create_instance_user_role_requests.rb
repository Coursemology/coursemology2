class CreateInstanceUserRoleRequests < ActiveRecord::Migration
  def change
    create_table :instance_user_role_requests do |t|
      t.integer :instance_id, null: false
      t.integer :user_id, null: false
      t.integer :role, null: false
      t.string :organization
      t.string :designation
      t.text :reason

      t.timestamps null: false
    end
  end
end
