# frozen_string_literal: true
class Course::Assessment::ReminderService
  include Course::ReminderServiceConcern

  class << self
    delegate :closing_reminder, to: :new
  end

  def closing_reminder(assessment, token)
    email_enabled = assessment.course.email_enabled(:assessments, :closing_reminder, assessment.tab.category.id)
    return unless assessment.closing_reminder_token == token && assessment.published?
    return unless email_enabled.phantom || email_enabled.regular

    send_closing_reminder(assessment)
  end

  def send_closing_reminder(assessment)
    students = uncompleted_subscribed_students(assessment)
    # Exclude students with personal times
    # TODO(#3240): Send closing reminder emails based on personal times
    students -=
      Set.new(CourseUser.joins(:personal_times).where(course_personal_times: { lesson_plan_item_id: assessment }))

    closing_reminder_students(assessment, students)
    closing_reminder_staff(assessment, students)
  end

  private

  # Send reminder emails to each student who hasn't submitted.
  #
  # @param [Course::Assessment] assessment The assessment to query.
  def closing_reminder_students(assessment, recipients)
    recipients.each do |recipient|
      # Need to get the User model from the Course User because we need the email address.
      Course::Mailer.assessment_closing_reminder_email(assessment, recipient.user).deliver_later
    end
  end

  # Send an email to each instructor with a list of students who haven't submitted.
  #
  # @param [Course::Assessment] assessment The assessment to query.
  def closing_reminder_staff(assessment, students)
    course_instructors = assessment.course.instructors.includes(:user)
    student_list = name_list(students)
    email_enabled = assessment.course.email_enabled(:assessments, :closing_reminder_summary, assessment.tab.category.id)
    course_instructors.each do |instructor|
      is_disabled_as_phantom = instructor.phantom? && !email_enabled.phantom
      is_disabled_as_regular = !instructor.phantom? && !email_enabled.regular
      next if is_disabled_as_phantom || is_disabled_as_regular
      next if instructor.email_unsubscriptions.where(course_settings_email_id: email_enabled.id).exists?

      Course::Mailer.assessment_closing_summary_email(instructor.user, assessment, student_list).deliver_later
    end
  end

  # Returns a Set of students who have not completed the given assessment.
  #
  # @param [Course::Assessment] assessment The assessment to query.
  # @return [Set<CourseUser>] Set of CourseUsers who have not finished the assessment.
  def uncompleted_subscribed_students(assessment)
    course_users = assessment.course.course_users
    email_enabled = assessment.course.email_enabled(:assessments, :closing_reminder, assessment.tab.category.id)
    # Eager load :user as it's needed for the recipient email.
    if email_enabled.regular && email_enabled.phantom
      students = course_users.student.includes(:user)
    elsif email_enabled.regular
      students = course_users.student.without_phantom_users.includes(:user)
    elsif email_enabled.phantom
      students = course_users.student.phantom.includes(:user)
    end
    submitted =
      assessment.submissions.confirmed.includes(experience_points_record: { course_user: :user }).
      map(&:course_user)
    unsubscribed = students.joins(:email_unsubscriptions).
                   where('course_user_email_unsubscriptions.course_settings_email_id = ?', email_enabled.id)
    Set.new(students) - Set.new(unsubscribed) - Set.new(submitted)
  end
end
