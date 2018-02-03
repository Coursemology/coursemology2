class AddFieldToCourseDiscussionTopics < ActiveRecord::Migration[4.2]
  def change
    add_column :course_discussion_topics, :pending_staff_reply, :boolean,
               null: false,
               default: false
  end
end
