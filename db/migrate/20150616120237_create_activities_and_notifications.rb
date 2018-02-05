# frozen_string_literal: true
class CreateActivitiesAndNotifications < ActiveRecord::Migration[4.2]
  def change
    create_table :activities do |t|
      t.references :actor, null: false, foreign_key: { references: :users }
      t.belongs_to :object, null: false, polymorphic: true
      t.string :event, null: false
      t.string :notifier_type, null: false

      t.timestamps null: false
    end

    create_table :user_notifications do |t|
      t.references :activity, null: false, index: true, foreign_key: true
      t.references :user, null: false, index: true, foreign_key: true
      t.integer :notification_type, null: false, default: 0

      t.timestamps null: false
    end

    create_table :course_notifications do |t|
      t.references :activity, null: false, index: true, foreign_key: true
      t.references :course, null: false, index: true, foreign_key: true
      t.integer :notification_type, null: false, default: 0

      t.timestamps null: false
    end
  end
end
