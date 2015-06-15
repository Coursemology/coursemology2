require 'csv'

# Provides a service object for inviting users into a course.
class Course::UserInvitationService
  # Constructor for the user invitation service object.
  #
  # @param [Course] current_course The course to invite users to.
  def initialize(current_course)
    @current_course = current_course
    @current_instance = @current_course.instance
  end

  # Invites users to the given course.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [bool]
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite(users)
    Course.transaction do
      if users.is_a?(File) || users.is_a?(Tempfile)
        invite_from_file(users)
      else
        invite_users(users.deep_dup)
      end

      @current_course.save
    end
  end

  private

  # Loads the given file, then invites the users.
  #
  # @param [File] file Reads the given file, in CSV format, for the name and email.
  # @return [void]
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite_from_file(file)
    invites = load_from_file(file)
    invite_users(invites)
  end

  # Loads the given file.
  #
  # @param [File] file Reads the given file.
  # @return [Array<Hash>] The array of records read from the file.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def load_from_file(file)
    invites = []
    CSV.foreach(file, headers: true) do |row|
      row = row.fields(0..1)
      row.unshift(row.first) unless row.length >= 2
      invites << { name: row[0], email: row[1] }
    end

    invites
  rescue StandardError => error
    raise CSV::MalformedCSVError.new(error), error.message
  end

  # Invites the given users into the course.
  #
  # @param [Array<Hash{Symbol=>String}>] users A mutable array of users to add. Each hash must have
  #   two attributes: the +:name+ and the +:email+ of the user to add.
  # @return [void]
  def invite_users(users)
    augment_user_objects(users)
    existing_users, new_users = users.partition { |user| user[:user].present? }

    add_existing_users(existing_users)
    invite_new_users(new_users)
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
    found_users = @current_instance.users.includes(:emails).references(emails: :email).
                  where { emails.email.in(email_addresses) }

    found_users.each.flat_map do |user|
      user.emails.map { |user_email| [user_email.email, user] }
    end.to_h
  end

  # Adds existing users to the course.
  #
  # @param [Array<Hash>] users The user descriptions to add to the course.
  # @return [void]
  def add_existing_users(users)
    users.each do |user|
      @current_course.course_users.build(user: user[:user], name: user[:name],
                                         workflow_state: :approved)
    end
  end

  # Generates invitations for users to the course.
  #
  # @param [Array<Hash>] users The user descriptions to invite.
  # @return [void]
  def invite_new_users(users)
    user_email_map = user_email_map(users.map { |user| user[:email] })

    users.each do |user|
      course_user = @current_course.course_users.build(name: user[:name], workflow_state: :invited)
      user_email = user_email_map[user[:email]] || UserEmail.new(email: user[:email])
      course_user.invitation = Course::UserInvitation.new(user_email: user_email)
    end
  end

  # Creates an email-to-user mapping, given a list of email addresses.
  #
  # @param [Array<String>] users An array of email addresses to query.
  # @return [Hash{String=>UserEmail}] The mapping from an email address to a +UserEmail+.
  def user_email_map(users)
    UserEmail.where { email.in(users) }.
      map { |user_email| [user_email.email, user_email] }.to_h
  end
end
