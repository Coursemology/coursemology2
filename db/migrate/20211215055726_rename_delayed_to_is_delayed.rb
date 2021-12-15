class RenameDelayedToIsDelayed < ActiveRecord::Migration[6.0]
  def change
    rename_column :course_discussion_posts, :delayed, :is_delayed
  end
end
