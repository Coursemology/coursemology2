class ChangeDiscussionPostsTitle < ActiveRecord::Migration[4.2]
  def change
    change_column :course_discussion_posts, :title, :string, null: true
  end
end
