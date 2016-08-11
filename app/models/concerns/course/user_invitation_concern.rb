# frozen_string_literal: true
module Course::UserInvitationConcern
  extend ActiveSupport::Concern

  # Invitations that in the invited state, i.e. pending the user's acceptance.
  def pending_acceptance
    merge(CourseUser.with_invited_state)
  end

  # Finds an invitation that matches one of the user's registered emails.
  #
  # @param [User] user
  def for_user(user)
    find_by(user_email: user.emails)
  end
end
