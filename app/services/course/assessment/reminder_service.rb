class Course::Assessment::ReminderService
  class << self
    delegate :opening_reminder, to: :new
    delegate :closing_reminder, to: :new
  end

  def opening_reminder(user, assessment, token)
    return unless assessment.opening_reminder_token == token && assessment.published?

    Course::AssessmentNotifier.assessment_opening(user, assessment)
  end

  def closing_reminder(user, assessment, token)
    return unless assessment.closing_reminder_token == token && assessment.published?

    Course::AssessmentNotifier.assessment_closing(user, assessment)
  end
end
