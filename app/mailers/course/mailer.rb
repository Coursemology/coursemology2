# frozen_string_literal: true
# The mailer for course emails.
class Course::Mailer < ApplicationMailer
  # Sends an invitation email for the given invitation.
  #
  # @param [Course] course The course that was involved.
  # @param [Course::UserInvitation] invitation The invitation which was generated.
  def user_invitation_email(course, invitation)
    @course = course
    @invitation = invitation
    @recipient = invitation

    mail(to: invitation.email, subject: t('.subject', course: @course.title))
  end

  # Sends a notification email to a user informing his registration in a course.
  #
  # @param [Course] course The course that was involved.
  # @param [CourseUser] user The user who was added.
  def user_added_email(course, user)
    @course = course
    @recipient = user.user

    mail(to: @recipient.email, subject: t('.subject', course: @course.title))
  end

  # Sends a notification email to the course managers to approve a given EnrolRequest.
  #
  # @param [Course] enrol_request The user enrol request.
  def user_registered_email(enrol_request)
    ActsAsTenant.without_tenant do
      @course = enrol_request.course
    end
    @enrol_request = enrol_request
    @recipient = OpenStruct.new(name: t('course.mailer.user_registered_email.recipients'))

    mail(to: @course.managers.map(&:user).map(&:email),
         subject: t('.subject', course: @course.title))
  end

  # Send a notification email to a user informing the completion of his course duplication.
  #
  # @param [Course] original_course The original course that was duplicated.
  # @param [Course] new_course The resulting course of the duplication.
  # @param [User] user The user who performed the duplication.
  def course_duplicated_email(original_course, new_course, user)
    @original_course = original_course
    @new_course = new_course
    @recipient = user

    mail(to: @recipient.email, subject: t('.subject', new_course: @new_course.title))
  end

  # Send a reminder of the assessment closing to a single user
  #
  # @param [Course::Assessment] assessment The assessment that is closing.
  # @param [User] user The user who hasn't done the assessment yet.
  def assessment_closing_reminder_email(assessment, user)
    @recipient = user
    @assessment = assessment
    ActsAsTenant.without_tenant do
      @course = assessment.course
    end

    mail(to: @recipient.email,
         subject: t('.subject', course: @course.title, assessment: @assessment.title))
  end

  # Send an email to all instructors with the names of users who haven't done
  # the assessment.
  #
  # @param [User] recipient The course instructor who will receive this email.
  # @param [Course::Assessment] assessment The assessment that is closing.
  # @param [String] users The users who haven't done the assessment yet.
  def assessment_closing_summary_email(recipient, assessment, users)
    ActsAsTenant.without_tenant do
      @course = assessment.course
    end
    @recipient = recipient
    @assessment = assessment
    @students = users

    mail(to: @recipient.email,
         subject: t('.subject', course: @course.title, assessment: @assessment.title))
  end

  # Send an email to the submission's creator when it has been graded.
  #
  # @param [Course::Assessment::Submission] submission The submission which was graded.
  def submission_graded_email(submission)
    ActsAsTenant.without_tenant do
      @course = submission.assessment.course
    end
    @recipient = submission.creator
    @assessment = submission.assessment
    @submission = submission

    mail(to: @recipient.email,
         subject: t('.subject', course: @course.title, assessment: @assessment.title))
  end

  # Send an email to notify a course user that the survey is open.
  #
  # @param [User] recipient The course user to notify.
  # @param [Course::Survey] survey The survey that has opened.
  def survey_opening_reminder_email(recipient, survey)
    ActsAsTenant.without_tenant do
      @course = survey.course
    end
    @recipient = recipient
    @survey = survey

    mail(to: @recipient.email,
         subject: t('.subject', course: @course.title, survey: @survey.title))
  end

  # Send a reminder of the survey closing to a single user.
  #
  # @param [User] recipient The student who has not completed the survey.
  # @param [Course::Survey] survey The survey that has opened.
  def survey_closing_reminder_email(recipient, survey)
    ActsAsTenant.without_tenant do
      @course = survey.course
    end
    @recipient = recipient
    @survey = survey

    mail(to: @recipient.email,
         subject: t('.subject', course: @course.title, survey: @survey.title))
  end

  # Send an email to a course instructor with the names of users who have not completed
  # the survey.
  #
  # @param [User] recipient The course instructor who will receive this email.
  # @param [Course::Survey] survey The survey that is closing.
  # @param [String] student_list The list of students who have not completed the survey.
  def survey_closing_summary_email(recipient, survey, student_list)
    ActsAsTenant.without_tenant do
      @course = survey.course
    end
    @recipient = recipient
    @survey = survey
    @student_list = student_list

    mail(to: @recipient.email,
         subject: t('.subject', course: @course.title, survey: @survey.title))
  end
end
