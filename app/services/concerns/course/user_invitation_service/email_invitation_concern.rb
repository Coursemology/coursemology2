# frozen_string_literal: true
require 'csv'

class Course::UserInvitationService; end
module Course::UserInvitationService::EmailInvitationConcern
  extend ActiveSupport::Autoload

  # Invites users to the given course.
  #
  # The result of the transaction is both saving the course as well as validating validity
  # because Rails does not handle duplicate nested attribute uniqueness constraints.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [Boolean] True if the invitations were successfully created and sent out. The errors
  #   that this method would add to the provided course is in the +course_users+ association.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite(users)
    registered_users = nil
    invited_users = nil

    success = Course.transaction do
      registered_users, invited_users = invite_from_source(users)
      return false if @current_course.invitations.any? { |invitation| !invitation.errors.empty? }
      @current_course.save
    end

    success && send_invitation_emails(registered_users, invited_users)
  end

  # Resends invitation emails to CourseUsers to the given course.
  # This method disregards CourseUsers that do not have an 'invited' status.
  #
  # @param [Array<Course::UserInvitation>] invitations An array of invitations to be resent.
  # @return [Boolean] True if there were no errors in sending invitations.
  #   If all provided CourseUsers have already registered, method also returns true.
  def resend_invitation(invitations)
    invitations.blank? ? true : resend_invitation_emails(invitations)
  end

  private

  # Invites users to the given course.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [Array<(Array<CourseUser>, Array<Course::UserInvitation>)>] A tuple containing the
  #   list of users who were immediately registered, and the users who were invited.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite_from_source(users)
    if users.is_a?(File) || users.is_a?(Tempfile)
      invite_from_file(users)
    else
      invite_from_form(users)
    end
  end

  # Loads the given file, then invites the users.
  #
  # @param [File] file Reads the given file, in CSV format, for the name and email.
  # @return [Array<(Array<CourseUser>, Array<Course::UserInvitation>)>] A tuple containing the
  #   list of users who were immediately registered, and the users who were invited.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite_from_file(file)
    invites = load_from_file(file)
    invite_users(invites)
  end

  # Loads the given file, and entries with blanks in either fields are ignored.
  #
  # @param [File] file Reads the given file.
  # @return [Array<Hash>] The array of records read from the file.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def load_from_file(file)
    invites = []
    CSV.foreach(file, headers: true) do |row|
      row = row.fields(0..1)
      row.unshift(row.first) unless row.length >= 2
      invites << { name: row[0], email: row[1] } unless row[0].blank? || row[1].blank?
    end

    invites
  rescue StandardError => error
    raise CSV::MalformedCSVError.new(error), error.message
  end

  # Invites the users from the form submission, which reflects the actual model associations.
  #
  # We do not use this format in the service object because it is very clumsy.
  #
  # @param [Hash] users The attributes from the client.
  # @return [void]
  def invite_from_form(users)
    invite_users(users.map do |(_, value)|
      { name: value[:name], email: value[:email] }
    end)
  end

  # Invites the given users into the course.
  #
  # @param [Array<Hash{Symbol=>String}>] users A mutable array of users to add. Each hash must have
  #   two attributes: the +:name+ and the +:email+ of the user to add. The provided +emails+
  #   are NOT case sensitive.
  # @return [Array<(Array<CourseUser>, Array<Course::UserInvitation>)>] A tuple containing the
  #   list of users who were immediately registered, and the users who were invited.
  def invite_users(users)
    users = users.each { |user| user[:email] = user[:email].downcase }
    augment_user_objects(users)
    existing_users, new_users = users.partition { |user| user[:user].present? }

    [add_existing_users(existing_users), invite_new_users(new_users)]
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
    # TODO: Move this search query into the +User+ model.
    found_users = @current_instance.users.includes(:emails).joins(:emails).
                  where('user_emails.email IN (?)', email_addresses)

    found_users.each.flat_map do |user|
      user.emails.map { |user_email| [user_email.email, user] }
    end.to_h
  end

  # Adds existing users to the course.
  #
  # @param [Array<Hash>] users The user descriptions to add to the course.
  # @return [Array<CourseUser>] An array containing a list of users who were immediately registered.
  def add_existing_users(users)
    users.map do |user|
      @current_course.course_users.build(user: user[:user], name: user[:name],
                                         creator: @current_user,
                                         updater: @current_user)
    end
  end

  # Generates invitations for users to the course.
  #
  # @param [Array<Hash>] users The user descriptions to invite.
  # @return [Array<Course::UserInvitation>)>] An array containing the list of users who were
  #   invited.
  def invite_new_users(users)
    invitations = users.map do |user|
      @current_course.invitations.build(name: user[:name], email: user[:email])
    end
    validate_new_invitation_emails(invitations)
  end

  # Sends invitation emails to the users invited.
  #
  # @param [Array<CourseUser>] registered_users An array of users who were registered.
  # @param [Array<Course::UserInvitation>] invited_users An array of invitations sent out to users.
  # @return [Boolean] True if the emails were dispatched.
  def send_invitation_emails(registered_users, invited_users)
    registered_users.each do |user|
      Course::Mailer.user_added_email(@current_course, user).deliver_later
    end
    resend_invitation_emails(invited_users)
  end

  # Resends invitation emails. This method also updates the sent_at timing for
  # Course::UserInvitation objects for tracking purposes.
  #
  # Note that since +deliver_later+ is used, this is an approximation on the time sent.
  #
  # @param [Array<Course::UserInvitation>] invitations An array of invitations sent out to users.
  # @return [Boolean] True if the invitations were updated.
  def resend_invitation_emails(invitations)
    invitations.each do |invitation|
      Course::Mailer.user_invitation_email(@current_course, invitation).deliver_later
    end
    ids = invitations.select(&:id)
    Course::UserInvitation.where(id: ids).update_all(sent_at: Time.zone.now)
    true
  end

  # Validate that the new invitation emails are unique.
  #
  # The uniqueness constraint of AR does not guarantee the new_records are unique among themselves.
  # ( i.e Two new records with the same email will raise a {RecordNotUnique} error upon saving. )
  #
  # @param [Array<Course::UserInvitation>] invitations An array of invitations.
  # @param [Array<Course::UserInvitation>] The validated invitations.
  def validate_new_invitation_emails(invitations)
    emails = invitations.map(&:email)
    duplicates = emails.select { |email| emails.count(email) > 1 }
    return invitations if duplicates.empty?

    invitations.each do |invitation|
      invitation.errors.add(:email, :taken) if duplicates.include?(invitation.email)
    end
    invitations
  end
end
