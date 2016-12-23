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

  # Sends a notification email to the course managers to approve a given Course Registration
  # Request.
  #
  # @param [Course] course The course which the user registered in.
  def user_registered_email(course, course_user)
    @course = course
    @course_user = course_user
    @recipient = OpenStruct.new(name: t('course.mailer.user_registered_email.recipients'))

    mail(to: @course.managers.map(&:user).map(&:email),
         subject: t('.subject', course: @course.title))
  end
end
