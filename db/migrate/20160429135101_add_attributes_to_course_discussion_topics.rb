class AddAttributesToCourseDiscussionTopics < ActiveRecord::Migration[4.2]
  def change
    change_table :course_discussion_topics do |t|
      t.references :course, null: false
      t.timestamps null: false
    end
  end
end
