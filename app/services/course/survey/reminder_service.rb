# frozen_string_literal: true
class Course::Survey::ReminderService
  include Course::ReminderServiceConcern

  class << self
    delegate :opening_reminder, to: :new
    delegate :closing_reminder, to: :new
    delegate :send_opening_reminder, to: :new
    delegate :send_closing_reminder, to: :new
  end

  def opening_reminder(survey, token)
    return unless survey.opening_reminder_token == token && survey.published?
    send_opening_reminder(survey)
  end

  def closing_reminder(survey, token)
    return unless survey.closing_reminder_token == token && survey.published?
    send_closing_reminder(survey)
  end

  def send_opening_reminder(survey)
    recipients = survey.course.course_users.includes(:user)
    recipients.each do |recipient|
      Course::Mailer.survey_opening_reminder_email(recipient.user, survey).deliver_later
    end
  end

  def send_closing_reminder(survey)
    students = uncompleted_students(survey)
    closing_reminder_students(survey, students)
    closing_reminder_staff(survey, students)
    survey.update_attribute(:closing_reminded_at, Time.zone.now)
  end

  private

  # Send reminder emails to each student who hasn't submitted.
  #
  # @param [Course::Survey] survey The survey to query.
  def closing_reminder_students(survey, recipients)
    recipients.each do |recipient|
      Course::Mailer.survey_closing_reminder_email(recipient.user, survey).deliver_later
    end
  end

  # Send an email to each instructor with a list of students who haven't submitted.
  #
  # @param [Course::Survey] survey The survey to query.
  def closing_reminder_staff(survey, students)
    course_instructors = survey.course.instructors.includes(:user).map(&:user)
    student_list = name_list(students)
    course_instructors.each do |instructor|
      Course::Mailer.survey_closing_summary_email(instructor, survey, student_list).deliver_later
    end
  end

  # Returns a Set of students who have not completed the given survey.
  #
  # @param [Course::Survey] survey The survey to query.
  # @return [Set<CourseUser>] Set of CourseUsers who have not finished the survey.
  def uncompleted_students(survey)
    course_users = survey.course.course_users
    # Eager load :user as it's needed for the recipient email.
    students = course_users.student.includes(:user)
    submitted =
      survey.responses.submitted.includes(experience_points_record: { course_user: :user }).
      map(&:course_user)
    Set.new(students) - Set.new(submitted)
  end
end
