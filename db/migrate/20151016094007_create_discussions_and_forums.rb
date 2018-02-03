# frozen_string_literal: true
class CreateDiscussionsAndForums < ActiveRecord::Migration[4.2]
  def change
    create_table :course_discussion_topics do |t|
      t.actable
    end

    create_table :course_discussion_posts do |t|
      t.references :parent
      t.belongs_to :topic, null: false, foreign_key: { references: :course_discussion_topics }
      t.string :title, null: false
      t.text :text

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_discussion_topic_subscriptions do |t|
      t.references :topic, null: false, foreign_key: { references: :course_discussion_topics }
      t.references :user, null: false, foreign_key: true
    end

    add_index :course_discussion_topic_subscriptions, [:topic_id, :user_id],
              unique: true, name: :index_topic_subscriptions_on_topic_id_and_user_id
  end
end
