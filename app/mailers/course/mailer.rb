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

end
