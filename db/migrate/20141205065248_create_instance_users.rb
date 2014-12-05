class CreateInstanceUsers < ActiveRecord::Migration
  def change
    create_table :instance_users do |t|
      t.references :instance, null: false
      t.references :user,
                   null: false,
                   index: :unique

      t.timestamps

      t.index [:instance_id, :user_id], unique: true
    end
  end
end
