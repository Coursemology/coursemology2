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
  # @return [Array<Integer>|nil] An array containing the the size of new_invitations, existing_invitations,
  #   new_course_users and existing_course_users respectively if success. nil when fail.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite(users)
    new_invitations = nil
    existing_invitations = nil
    new_course_users = nil
    existing_course_users = nil

    success = Course.transaction do
      new_invitations, existing_invitations, new_course_users, existing_course_users = invite_from_source(users)
      raise ActiveRecord::Rollback unless new_invitations.all?(&:save)
      raise ActiveRecord::Rollback unless new_course_users.all?(&:save)
      true
    end

    send_registered_emails(new_course_users) if success
    send_invitation_emails(new_invitations) if success
    success ? [new_invitations, existing_invitations, new_course_users, existing_course_users].map(&:size) : nil
  end

  # Resends invitation emails to CourseUsers to the given course.
  # This method disregards CourseUsers that do not have an 'invited' status.
  #
  # @param [Array<Course::UserInvitation>] invitations An array of invitations to be resent.
  # @return [Boolean] True if there were no errors in sending invitations.
  #   If all provided CourseUsers have already registered, method also returns true.
  def resend_invitation(invitations)
    invitations.blank? ? true : send_invitation_emails(invitations)
  end

  private

  # Invites users to the given course.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return
  #   [Array<(Array<Course::UserInvitation>, Array<Course::UserInvitation>, Array<CourseUser>, Array<CourseUser>)>]
  #   A tuple containing the users newly invited, already invited, newly registered and already registered respectively.
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
  # @return
  #   [Array<(Array<Course::UserInvitation>, Array<Course::UserInvitation>, Array<CourseUser>, Array<CourseUser>)>]
  #   A tuple containing the users newly invited, already invited, newly registered and already registered respectively.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite_from_file(file)
    invites = load_from_file(file)
    invite_users(invites)
  end

  # Loads the given file, and entries with blanks in either fields are ignored.
  # The first row is ignored if it's a header row (contains "name, email"),
  # else it's treated like a row of student data.
  #
  # @param [File] file Reads the given file.
  # @return [Array<Hash>] The array of records read from the file.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def load_from_file(file)
    invites = []

    CSV.foreach(file).with_index(1) do |row, row_number|
      # Ignore first row if it's a header row.
      next if row_number == 1 && row[0].casecmp('Name') == 0 && row[1].casecmp('Email') == 0
      row.unshift(row.first) unless row.length >= 2

      role = parse_file_role(row[2])
      invites << { name: row[0], email: row[1], role: role } unless row[0].blank? || row[1].blank?
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
      { name: value[:name], email: value[:email], role: value[:role] }
    end)
  end

  # Invites the given users into the course.
  #
  # @param [Array<Hash{Symbol=>String}>] users A mutable array of users to add. Each hash must have
  #   three attributes: the +:name+, the +:email+ of the user to add, as well as his intended +:role+ in the course.
  #   The provided +emails+ are NOT case sensitive.
  # @return
  #   [Array<(Array<Course::UserInvitation>, Array<Course::UserInvitation>, Array<CourseUser>, Array<CourseUser>)>]
  #   A tuple containing the users newly invited, already invited, newly registered and already registered respectively.
  def invite_users(users)
    users = users.each { |user| user[:email] = user[:email].downcase }
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
        new_course_users << @current_course.course_users.build(user: user[:user], name: user[:name], role: user[:role],
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
        new_invitations << @current_course.invitations.build(name: user[:name], email: user[:email], role: user[:role])
      end
    end

    [validate_new_invitation_emails(new_invitations), existing_invitations]
  end

  # Parses the role column from the CSV file.
  # This method handles the case where the role is not specified too, where "student" will be assumed.
  #
  # @param [String] role The role as specified in the CSV file
  # @return [Integer] The enum integer for +Course::UserInvitation.role+ matching the input.
  #                   (+Course::UserInvitation.roles[:student]+) is returned by default.
  def parse_file_role(role)
    return Course::UserInvitation.roles[:student] if role.blank?

    symbol = role.parameterize(separator: '_').to_sym
    Course::UserInvitation.roles[symbol] || Course::UserInvitation.roles[:student]
  end

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

  # Validate that the new invitation emails are unique.
  #
  # The uniqueness constraint of AR does not guarantee the new_records are unique among themselves.
  # ( i.e Two new records with the same email will raise a {RecordNotUnique} error upon saving. )
  #
  # @param [Array<Course::UserInvitation>] invitations An array of invitations.
  # @return [Array<Course::UserInvitation>] The validated invitations.
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
