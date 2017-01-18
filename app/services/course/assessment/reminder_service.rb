class Course::Assessment::ReminderService
  class << self
    delegate :opening_reminder, to: :new
    delegate :closing_reminder, to: :new
  end

  def opening_reminder(user, assessment, token)
    return unless assessment.opening_reminder_token == token && assessment.published?

    Course::AssessmentNotifier.assessment_opening(user, assessment)
  end

  def closing_reminder(assessment, token)
    return unless assessment.closing_reminder_token == token && assessment.published?

    recipients = uncompleted_students(assessment)
    recipients.each do |recipient|
      Course::Mailer.assessment_closing_reminder_email(assessment, recipient).deliver_later
    end
  end

  private

  def uncompleted_students(assessment)
    course_users = assessment.course.course_users
    students = course_users.student.includes(:user).map(&:user)
    submitted =
      assessment.submissions.confirmed.includes([course_user: :user]).map { |s| s.course_user.user }
    Set.new(students) - Set.new(submitted)
  end
end
