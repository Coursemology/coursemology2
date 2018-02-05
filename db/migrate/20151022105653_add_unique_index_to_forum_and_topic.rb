# frozen_string_literal: true
class AddUniqueIndexToForumAndTopic < ActiveRecord::Migration[4.2]
  def change
    remove_index :course_forums, column: :slug
    remove_index :course_forum_topics, column: :slug
    add_index :course_forums, [:course_id, :slug], unique: true
    add_index :course_forum_topics, [:forum_id, :slug], unique: true
  end
end
