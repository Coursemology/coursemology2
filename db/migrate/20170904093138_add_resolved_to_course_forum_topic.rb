class AddResolvedToCourseForumTopic < ActiveRecord::Migration
  def change
    add_column :course_forum_topics, :resolved, :boolean, default: false, null: false
    # Set all previous forum questions to resolved
    Course::Forum::Topic.where(topic_type: 1).update_all(resolved: true)
  end
end
