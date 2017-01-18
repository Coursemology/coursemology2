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

    # Send reminder emails to each student who hasn't submitted.
    recipients = uncompleted_students(assessment)
    recipients.each do |recipient|
      Course::Mailer.assessment_closing_reminder_email(assessment, recipient).deliver_later
    end

    # Send an email to each instructor with a list of students who haven't submitted.
    course_instructors = assessment.course.instructors.map(&:user)
    course_instructors.each do |instructor|
      Course::Mailer.assessment_closing_summary_email(
        instructor, assessment, uncompleted_students_list(recipients)
      ).deliver_later
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

  # Converts a set of students to a string, with each name on a new line.
  # Sorts the names alphabetically and prepends an index number to each name.
  def uncompleted_students_list(students)
    students = students.to_a.map(&:name).sort!
    students.each_with_index do |student, index|
      students[index] = "#{index + 1}. #{student}"
    end.join("\n")
  end
end
