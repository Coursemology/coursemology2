# frozen_string_literal: true

# This concern deals with the creation of user invitations.
class Course::UserInvitationService; end
module Course::UserInvitationService::ProcessInvitationConcern
  extend ActiveSupport::Autoload

  private

  # Processes the invites of the given users into the course.
  #
  # @param [Array<Hash{Symbol=>String}>] users A mutable array of users to add.
  #   Each hash must have four attributes:
  #     the +:name+,
  #     the +:email+ of the user to add,
  #     the intended +:role+ in the course, as well as
  #     whether the user is a +:phantom:+ or not.
  #   The provided +emails+ are NOT case sensitive.
  # @return
  #   [Array<(Array<Course::UserInvitation>, Array<Course::UserInvitation>, Array<CourseUser>, Array<CourseUser>)>]
  #   A tuple containing the users newly invited, already invited, newly registered and already registered respectively.
  def process_invitations(users)
    augment_user_objects(users)
    existing_users, new_users = users.partition { |user| user[:user].present? }

    [*invite_new_users(new_users), *add_existing_users(existing_users)]
  end

  # Given an array of hashes containing the email address and name of a user to invite, finds the
  # appropriate +User+ object and mutates each hash to have the appropriate user if the user exists.
  #
  # @param [Array<Hash{Symbol=>String}] users The array of hashes to mutate.
  # @return [void]
  def augment_user_objects(users)
    email_user_mapping = find_existing_users(users.map { |user| user[:email] })
    users.each { |user| user[:user] = email_user_mapping[user[:email]] }
  end

  # Given a list of email addresses, returns a Hash containing the mappings from email addresses
  # to users.
  #
  # @param [Array<String>] email_addresses An array of email addresses to query.
  # @return [Hash{String=>User}] The mapping from email address to users.
  def find_existing_users(email_addresses)
    found_users = User.with_email_addresses(email_addresses)

    found_users.each.flat_map do |user|
      user.emails.map { |user_email| [user_email.email, user] }
    end.to_h
  end

  # Adds existing users to the course.
  #
  # @param [Array<Hash>] users The user descriptions to add to the course.
  # @return [Array(Array<CourseUser>, Array<CourseUser>)] A tuple containing the list of users who were newly enrolled
  #   and already enrolled.
  def add_existing_users(users)
    all_course_users = @current_course.course_users.map { |cu| [cu.user_id, cu] }.to_h
    existing_course_users = []
    new_course_users = []
    users.each do |user|
      course_user = all_course_users[user[:user].id]
      if course_user
        existing_course_users << course_user
      else
        new_course_users <<
          @current_course.course_users.build(user: user[:user], name: user[:name],
                                             role: user[:role], phantom: user[:phantom],
                                             creator: @current_user, updater: @current_user)
      end
    end

    [new_course_users, existing_course_users]
  end

  # Generates invitations for users to the course.
  #
  # @param [Array<Hash>] users The user descriptions to invite.
  # @return [Array(Array<Course::UserInvitation>, Array<Course::UserInvitation>)] A tuple containing the list of users
  #   who were newly invited and already invited.
  def invite_new_users(users)
    all_invitations = @current_course.invitations.map { |i| [i.email.downcase, i] }.to_h
    new_invitations = []
    existing_invitations = []
    users.each do |user|
      invitation = all_invitations[user[:email]]
      if invitation
        existing_invitations << invitation
      else
        new_invitations <<
          @current_course.invitations.build(name: user[:name], email: user[:email],
                                            role: user[:role], phantom: user[:phantom])
      end
    end

    [new_invitations, existing_invitations]
  end
end
