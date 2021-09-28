class ResetReminderJobs < ActiveRecord::Migration[5.1]
  def up
    reset_opening_reminders
    reset_closing_reminders
  end

  def down; end

  private

  def reset_opening_reminders
    system_user = User.find(0)

    ActsAsTenant.without_tenant do
      Course::LessonPlan::Item.
        where("start_at > NOW() AND actable_type != 'Course::LessonPlan::Event'").find_each do |item|
        opening_reminder_token = Time.zone.now.to_f.round(5)
        item.opening_reminder_token = opening_reminder_token
        item.save!

        "#{item.actable_type}::OpeningReminderJob".constantize.set(wait_until: item.start_at).
          perform_later(system_user, item.actable, opening_reminder_token)
      end
    end
  end

  def reset_closing_reminders
    ActsAsTenant.without_tenant do
      Course::LessonPlan::Item.where("end_at > ? AND actable_type != 'Course::LessonPlan::Event'",
                                     Time.zone.now - 1.day).
        find_each do |item|
        closing_reminder_token = Time.zone.now.to_f.round(5)
        item.closing_reminder_token = closing_reminder_token
        item.save!

        "#{item.actable_type}::ClosingReminderJob".constantize.set(wait_until: item.end_at - 1.day).
          perform_later(item.actable, closing_reminder_token)
      end
    end
  end
end
