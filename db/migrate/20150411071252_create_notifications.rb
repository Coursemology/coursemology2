class CreateNotifications < ActiveRecord::Migration
  def change
    create_table :notifications do |t|
      t.integer :user_id, null: false, foreign_key: { references: :users }
      t.integer :course_id, null: false, foreign_key: { references: :courses }
      t.string :type
      t.string :title
      t.text :content
      t.string :image
      t.string :link
      t.boolean :share

      t.timestamps null: false
    end
  end
end
