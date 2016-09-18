class ChangeDiscussionPostsTitle < ActiveRecord::Migration
  def change
    change_column :course_discussion_posts, :title, :string, null: true
  end
end
