class CreateNotifications < ActiveRecord::Migration
  def change
    create_table :notifications do |t|
      t.boolean :activity_feed
      t.boolean :email
      t.boolean :popup

      t.timestamps null: false
    end
  end
end
