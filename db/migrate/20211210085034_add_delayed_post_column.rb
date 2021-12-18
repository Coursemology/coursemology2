class AddDelayedPostColumn < ActiveRecord::Migration[6.0]
  def change
    add_column :course_discussion_posts, :delayed, :boolean, default: false, null: false
  end
end
