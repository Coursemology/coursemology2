# frozen_string_literal: true
class Course::Survey::ReminderService
  include Course::ReminderServiceConcern

  class << self
    delegate :closing_reminder, to: :new
    delegate :send_closing_reminder, to: :new
  end

  def closing_reminder(survey, token)
    email_enabled = survey.course.email_enabled(:surveys, :closing_reminder)
    return unless survey.closing_reminder_token == token && survey.published?
    return unless email_enabled.phantom || email_enabled.regular

    send_closing_reminder(survey)
  end

  def send_closing_reminder(survey)
    students = uncompleted_subscribed_students(survey)
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
    course_instructors = survey.course.instructors.includes(:user)
    student_list = name_list(students)
    email_enabled = survey.course.email_enabled(:surveys, :closing_reminder_summary)
    course_instructors.each do |instructor|
      next if instructor.phantom? && !email_enabled.phantom
      next if !instructor.phantom? && !email_enabled.regular
      next if instructor.email_unsubscriptions.where(course_settings_email_id: email_enabled.id).exists?

      Course::Mailer.survey_closing_summary_email(instructor.user, survey, student_list).deliver_later
    end
  end

  # Returns a Set of students who have not completed the given survey and subscribe to the survey email.
  #
  # @param [Course::Survey] survey The survey to query.
  # @return [Set<CourseUser>] Set of CourseUsers who have not finished the survey.
  def uncompleted_subscribed_students(survey)
    course_users = survey.course.course_users
    email_enabled = survey.course.email_enabled(:surveys, :closing_reminder)
    # Eager load :user as it's needed for the recipient email.
    students = if email_enabled.regular && !email_enabled.phantom
                 course_users.student.without_phantom_users.includes(:user)
               elsif email_enabled.phantom && !email_enabled.regular
                 course_users.student.phantom.includes(:user)
               else
                 course_users.student.includes(:user)
               end
    submitted =
      survey.responses.submitted.includes(experience_points_record: { course_user: :user }).
      map(&:course_user)
    unsubscribed = students.joins(:email_unsubscriptions).
                   where('course_user_email_unsubscriptions.course_settings_email_id = ?', email_enabled.id)
    Set.new(students) - Set.new(unsubscribed) - Set.new(submitted)
  end
end
