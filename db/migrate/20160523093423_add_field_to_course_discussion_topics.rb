class AddFieldToCourseDiscussionTopics < ActiveRecord::Migration
  def change
    add_column :course_discussion_topics, :pending_staff_reply, :boolean,
               null: false,
               default: false
  end
end
