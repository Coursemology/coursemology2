class AddTokensToCourseAnnouncements < ActiveRecord::Migration[5.1]
  def change
    add_column :course_announcements, :opening_reminder_token, :float

    # This is similar to adding tokens to lesson plan items for assessments in
    # db/migrate/20170116103602_add_tokens_to_course_lesson_plan_items.rb.
    # There are currently no future announcements, even if there are, the emails have already
    # been sent so don't create new jobs to send them again.
  end
end
