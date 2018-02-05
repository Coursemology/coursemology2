# frozen_string_literal: true
class CombineInstanceSystemAnnouncements < ActiveRecord::Migration[4.2]
  def change
    drop_table :system_announcements
    drop_table :instance_announcements

    create_table :generic_announcements do |t|
      t.string :type, null: false
      t.references :instance, comment: 'The instance this announcement is associated with. This '\
        'only applies to instance announcements.'
      t.string :title, null: false
      t.text :content
      t.time_bounded null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
