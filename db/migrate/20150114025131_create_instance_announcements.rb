class CreateInstanceAnnouncements < ActiveRecord::Migration
  def change
    create_table :instance_announcements do |t|
      t.references :instance, null: false
      t.string :title, null: false
      t.text :content
      t.time_bounded null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
