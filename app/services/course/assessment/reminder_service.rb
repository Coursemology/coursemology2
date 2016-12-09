class Course::Assessment::ReminderService
  class << self
    delegate :opening_reminder, to: :new
    delegate :closing_reminder, to: :new
  end

  def opening_reminder(user, assessment, start_at)
    return unless start_at.round(4) == assessment.start_at.to_f.round(4) && assessment.published?

    Course::AssessmentNotifier.assessment_opening(user, assessment)
  end

  def closing_reminder(user, assessment, end_at)
    return unless end_at.round(4) == assessment.end_at.to_f.round(4) && assessment.published?

    Course::AssessmentNotifier.assessment_closing(user, assessment)
  end
end
