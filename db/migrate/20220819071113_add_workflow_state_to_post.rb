class AddWorkflowStateToPost < ActiveRecord::Migration[6.0]
  def up
    add_column :course_discussion_posts, :workflow_state, :string, default: 'published'

    ActiveRecord::Base.connection.exec_update(
      "UPDATE course_discussion_posts
       SET workflow_state = 'delayed'
       WHERE is_delayed = TRUE"
    )
    # remove_column :course_discussion_posts, :is_delayed
  end

  def down
    # add_column :course_discussion_posts, :is_delayed, :boolean, default: false, null: false
    ActiveRecord::Base.connection.exec_update(
      "UPDATE course_discussion_posts
       SET is_delayed = TRUE
       WHERE workflow_state = 'delayed'"
    )

    remove_column :course_discussion_posts, :workflow_state
  end
end
