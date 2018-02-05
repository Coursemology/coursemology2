class AddTokensToCourseLessonPlanItems < ActiveRecord::Migration[4.2]
  def change
    add_column :course_lesson_plan_items, :opening_reminder_token, :float
    add_column :course_lesson_plan_items, :closing_reminder_token, :float

    Course::Assessment.joins(:lesson_plan_item).
      where('course_lesson_plan_items.start_at > ?', Time.zone.now).find_each do |assessment|
      # Remove milliseconds part of the assessment
      assessment.lesson_plan_item.update_column(:start_at, assessment.start_at.change(usec: 0))

      # Create the new reminder job
      token = Time.zone.now.to_f.round(5)
      assessment.lesson_plan_item.update_column(:opening_reminder_token, token)
      Course::Assessment::OpeningReminderJob.set(wait_until: assessment.start_at).
        perform_later(assessment.updater, assessment, token)
    end

    Course::Assessment.joins(:lesson_plan_item).
      where('course_lesson_plan_items.end_at > ?', 1.day.from_now).find_each do |assessment|
      # Remove milliseconds part of the assessment
      assessment.lesson_plan_item.update_column(:end_at, assessment.end_at.change(usec: 0))

      # Create the new reminder job
      token = Time.zone.now.to_f.round(5)
      assessment.lesson_plan_item.update_column(:closing_reminder_token, token)
      Course::Assessment::ClosingReminderJob.set(wait_until: assessment.end_at - 1.day).
        perform_later(assessment.updater, assessment, token)
    end
  end
end
