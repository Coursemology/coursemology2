# frozen_string_literal: true
class AddAnonymousToForumPost < ActiveRecord::Migration[6.0]
  def change
    add_column :course_discussion_posts, :is_anonymous, :boolean, default: false, null: false
  end
end
