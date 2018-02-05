# frozen_string_literal: true
class CreateForums < ActiveRecord::Migration[4.2]
  def change
    create_table :course_forums do |t|
      t.references :course, null: false
      t.string :name, null: false
      t.string :slug, index: :unique
      t.text :description

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_forum_topics do |t|
      t.belongs_to :forum, null: false, foreign_key: { references: :course_forums }
      t.string :title, null: false
      t.string :slug, index: :unique
      t.boolean :locked, default: false
      t.boolean :hidden, default: false
      t.integer :topic_type, default: 0

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_forum_topic_views do |t|
      t.references :topic, null: false, foreign_key: { references: :course_forum_topics }
      t.references :user, null: false, foreign_key: true

      t.timestamps null: false
    end

    create_table :course_forum_subscriptions do |t|
      t.references :forum, null: false, foreign_key: { references: :course_forums }
      t.references :user, null: false, foreign_key: true
    end

    add_index :course_forum_subscriptions, [:forum_id, :user_id], unique: true
  end
end
