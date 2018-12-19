# frozen_string_literal: true
require 'csv'

# This concern includes methods required to parse the invitations data.
# This can either be from a form, or a CSV file.
class Course::UserInvitationService; end
module Course::UserInvitationService::ParseInvitationConcern
  extend ActiveSupport::Autoload

  TRUE_VALUES = ['t', 'true', 'y', 'yes'].freeze

  private

  # Invites users to the given course.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [
  #   [Array<Hash{Symbol=>String}>],
  #   [Array<Hash>]
  # ]
  #   Both subarrays are mutable array of users to add. Each hash must have four attributes:
  #     the +:name+,
  #     the +:email+ of the user to add,
  #     the intended +:role+ in the course, as well as
  #     whether the user is a +:phantom:+ or not.
  #   The provided +emails+ are NOT case sensitive.
  #   The second subarray contains the leftover duplicate users.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def parse_invitations(users)
    result =
      if users.is_a?(File) || users.is_a?(Tempfile)
        parse_from_file(users)
      else
        parse_from_form(users)
      end

    partition_unique_users(result)
  end

  # Partition users into unique (including first duplicate instance) and duplicate users.
  #
  # @param [Array<Hash>] users
  # @return [
  #   [Array<Hash>],
  #   [Array<Hash>]
  # ]
  def partition_unique_users(users)
    users.each { |user| user[:email] = user[:email].downcase }
    unique_users = {}
    duplicate_users = []
    users.each do |user|
      if unique_users.key?(user[:email])
        duplicate_users.push(user)
      else
        unique_users[user[:email]] = user
      end
    end
    [unique_users.values, duplicate_users]
  end

  # Invites the users from the form submission, which reflects the actual model associations.
  #
  # We do not use this format in the service object because it is very clumsy.
  #
  # @param [Hash] users The attributes from the client.
  # @return [Array<Hash>] Array of users to be invited
  def parse_from_form(users)
    users.map do |(_, value)|
      name = value[:name].presence || value[:email]
      phantom = ActiveRecord::Type::Boolean.new.cast(value[:phantom])
      { name: name, email: value[:email], role: value[:role], phantom: phantom }
    end
  end

  # Loads the given file, and entries with blanks in either fields are ignored.
  # The first row is ignored if it's a header row (contains "name, email"),
  # else it's treated like a row of student data.
  #
  # This method also handles the presence of UTF-8 Byte Order Marks at the
  # start of the file, if it exists. These are invisible characters that might
  # be persisted as the name of the student if not caught.
  #
  # @param [File] file Reads the given file, in CSV format, for the name and email.
  # @return [Array<Hash>] The array of records read from the file.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid, eg. UTF-16 encoding.
  def parse_from_file(file)
    [].tap do |invites|
      CSV.foreach(file).with_index(1) do |row, row_number|
        row[0] = remove_utf8_byte_order_mark(row[0]) if row_number == 1
        row = strip_row(row)
        # Ignore first row if it's a header row.
        next if row_number == 1 && header_row?(row)

        invite = parse_file_row(row)
        invites << invite if invite
      end
    end
  rescue StandardError => error
    raise CSV::MalformedCSVError.new(error), error.message
  end

  # Returns a boolean to determine whether the row is a header row.
  #
  # @param[Array] row Array read from CSV file.
  # @return [Boolean] Whether the row is a header row
  def header_row?(row)
    row[0].casecmp('Name') == 0 && row[1].casecmp('Email') == 0
  end

  # Strips a row of whitespaces.
  #
  # @param[Array] row Array read from CSV file.
  # @return [Array] Provided row with string stripped of whitespates.
  def strip_row(row)
    row.map { |item| item&.strip }
  end

  # Parses the given CSV row (array) and returns attributes for a user invitation.
  #   - Sets the name as the given email if a name was not provided.
  #
  # @param [Array] row Array with 3 parameters: name, email and role respectively.
  # @return [Hash] The parsed invitation attributes given the row.
  def parse_file_row(row)
    return nil if row[1].blank?
    row[0] = row[1] if row[0].blank?

    role = parse_file_role(row[2])
    phantom = parse_file_phantom(row[3])
    { name: row[0], email: row[1], role: role, phantom: phantom }
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

  # Parses file value for whether an invitation is a phantom or not.
  # Sets phantom as false if value is not specified.
  #
  # @param [String|nil] Phantom column for the given user invitation.
  # @return [Boolean] Whether the value is a true or false
  def parse_file_phantom(phantom)
    return false if phantom.blank?

    TRUE_VALUES.include?(phantom.downcase)
  end

  # Removes the UTF-8 byte order mark (BOM) from the string.
  # The BOM exists at the start of in CSVs (optionally) to indicate the
  # encoding of the file.
  #
  # @param [String] String to remove UTF-8 BOM
  # @return [String] String with removed UTF-8 BOM
  def remove_utf8_byte_order_mark(str)
    str.sub("\xEF\xBB\xBF", '')
  end
end
