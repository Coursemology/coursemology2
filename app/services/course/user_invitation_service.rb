require 'csv'

# Provides a service object for inviting users into a course.
class Course::UserInvitationService
  # Constructor for the user invitation service object.
  #
  # @param [User] current_user The user performing this action.
  # @param [Course] current_course The course to invite users to.
  def initialize(current_user, current_course)
    @current_user = current_user
    @current_course = current_course
    @current_instance = @current_course.instance
  end

  # Invites users to the given course.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [Boolean] True if the invitations were successfully created and sent out. The errors
  #   that this method would add to the provided course is in the +course_users+ association.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite(users)
    Course.transaction do
      registered_users, invited_users = invite_from_source(users)

      break false if !@current_course.save || !@current_course.valid?
      send_invitation_emails(registered_users, invited_users)
    end
  end

  # Enables or disables registration codes in the given course.
  #
  # @param [Boolean] enable True if registration codes should be enabled.
  # @return [Boolean]
  def enable_registration_code(enable)
    if enable
      return true if @current_course.registration_key
      generate_registration_key
    else
      @current_course.registration_key = nil
    end
    @current_course.save
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

  # Invites the users from the form submission, which reflects the actual model associations.
  #
  # We do not use this format in the service object because it is very clumsy.
  #
  # @param [Hash] users The attributes from the client.
  # @return [void]
  def invite_from_form(users)
    invite_users(users.map do |(_, value)|
      { name: value[:course_user][:name], email: value[:user_email][:email] }
    end)
  end

  # Invites the given users into the course.
  #
  # @param [Array<Hash{Symbol=>String}>] users A mutable array of users to add. Each hash must have
  #   two attributes: the +:name+ and the +:email+ of the user to add.
  # @return [Array<(Array<CourseUser>, Array<Course::UserInvitation>)>] A tuple containing the
  #   list of users who were immediately registered, and the users who were invited.
  def invite_users(users)
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
    found_users = @current_instance.users.includes(:emails).references(emails: :email).
                  where { emails.email.in(email_addresses) }

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
                                         workflow_state: :approved, creator: @current_user,
                                         updater: @current_user)
    end
  end

  # Generates invitations for users to the course.
  #
  # @param [Array<Hash>] users The user descriptions to invite.
  # @return [Array<Course::UserInvitation>)>] An array containing the list of users who were
  #   invited.
  def invite_new_users(users)
    user_email_map = user_email_map(users.map { |user| user[:email] })

    users.map do |user|
      course_user = @current_course.course_users.build(name: user[:name], workflow_state: :invited,
                                                       creator: @current_user,
                                                       updater: @current_user)
      user_email = user_email_map[user[:email]] || User::Email.new(email: user[:email])
      user_email.skip_confirmation!
      course_user.build_invitation(user_email: user_email, creator: @current_user,
                                   updater: @current_user)
    end
  end

  # Creates an email-to-user mapping, given a list of email addresses.
  #
  # @param [Array<String>] users An array of email addresses to query.
  # @return [Hash{String=>User::Email}] The mapping from an email address to a +User::Email+.
  def user_email_map(users)
    User::Email.where { email.in(users) }.
      map { |user_email| [user_email.email, user_email] }.to_h
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
    invited_users.each do |user|
      Course::Mailer.user_invitation_email(@current_course, user).deliver_later
    end
    true
  end

  # Generates a registration key for the course.
  #
  # @return [void]
  def generate_registration_key
    @current_course.generate_registration_key
  end
end
