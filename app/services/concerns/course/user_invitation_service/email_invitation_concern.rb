# frozen_string_literal: true

# This concern deals with the sending of user invitation emails.
class Course::UserInvitationService; end
module Course::UserInvitationService::EmailInvitationConcern
  extend ActiveSupport::Autoload

  private

  # Sends registered emails to the users invited.
  #
  # @param [Array<CourseUser>] registered_users An array of users who were registered.
  # @return [Boolean] True if the emails were dispatched.
  def send_registered_emails(registered_users)
    registered_users.each do |user|
      Course::Mailer.user_added_email(@current_course, user).deliver_later
    end

    true
  end

  # Sends invitation emails. This method also updates the sent_at timing for
  # Course::UserInvitation objects for tracking purposes.
  #
  # Note that since +deliver_later+ is used, this is an approximation on the time sent.
  #
  # @param [Array<Course::UserInvitation>] invitations An array of invitations sent out to users.
  # @return [Boolean] True if the invitations were updated.
  def send_invitation_emails(invitations)
    invitations.each do |invitation|
      Course::Mailer.user_invitation_email(@current_course, invitation).deliver_later
    end
    ids = invitations.select(&:id)
    Course::UserInvitation.where(id: ids).update_all(sent_at: Time.zone.now)

    true
  end
end
