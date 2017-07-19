# frozen_string_literal: true
class Course::Assessment::ReminderService
  include Course::ReminderServiceConcern

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
    return unless email_enabled?(assessment, :assessment_closing)

    # Send reminder emails to each student who hasn't submitted.
    recipients = uncompleted_students(assessment)
    recipients.each do |recipient|
      # Need to get the User model from the Course User because we need the email address.
      Course::Mailer.assessment_closing_reminder_email(assessment, recipient.user).deliver_later
    end

    # Send an email to each instructor with a list of students who haven't submitted.
    course_instructors = assessment.course.instructors.includes(:user).map(&:user)
    student_list = name_list(recipients)
    course_instructors.each do |instructor|
      Course::Mailer.assessment_closing_summary_email(
        instructor, assessment, student_list
      ).deliver_later
    end
  end

  private

  def email_enabled?(assessment, key)
    Course::Settings::AssessmentsComponent.email_enabled?(assessment.tab.category, key)
  end

  # Returns a Set of students who have not completed the given assessment.
  #
  # @param [Course::Assessment] assessment The assessment to query.
  # @return [Set<CourseUser>] Set of CourseUsers who have not finished the assessment.
  def uncompleted_students(assessment)
    course_users = assessment.course.course_users
    # Eager load :user as it's needed for the recipient email.
    students = course_users.student.includes(:user)
    submitted =
      assessment.submissions.confirmed.includes(experience_points_record: { course_user: :user }).
      map(&:course_user)
    Set.new(students) - Set.new(submitted)
  end
end
