# frozen_string_literal: true
require 'csv'
require 'set'

# This concern includes methods required to parse the invitations data.
# This can either be from a form, or a CSV file.
class Course::UserInvitationService; end

module Course::UserInvitationService::ParseInvitationConcern
  extend ActiveSupport::Autoload

  TRUE_VALUES = ['t', 'true', 'y', 'yes'].freeze
  SUPPORTED_LOCALES = %i[en zh ko].freeze
  CANONICAL_COLUMNS = %i[name email external_id role phantom personal_timeline].freeze

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

    restrict_invitee_role(result)
  end

  # Partition users into unique (including first duplicate instance) and duplicate users.
  #
  # Email dedup applies to all rows. External-ID dedup applies only to rows whose email
  # is NOT in +existing_account_emails+ — users with existing platform accounts are handled
  # by the DB-aware process phase, so pre-deduping their external IDs here would incorrectly
  # fail rows that the process phase would accept (e.g. an enrolled user re-uploaded with
  # their current external ID).
  #
  # @param [Array<Hash>] users
  # @param [Set<String>] existing_account_emails Downcased emails of users who already have
  #   a platform account. These rows skip external-ID dedup.
  # @return [[Array<Hash>, Array<Hash>]]
  def partition_unique_users(users, existing_account_emails = Set.new)
    users.each { |u| u[:email] = u[:email].downcase }
    seen_emails, seen_external_ids = Set.new, Set.new
    users.each_with_object([[], []]) do |user, (unique, failed)|
      reason = duplicate_reason(user, seen_emails, seen_external_ids, existing_account_emails)
      if reason
        failed << user.merge(reason: reason)
      else
        track_seen_user!(user, seen_emails, seen_external_ids, existing_account_emails)
        unique << user
      end
    end
  end

  def duplicate_reason(user, seen_emails, seen_external_ids, existing_account_emails)
    return :duplicate_email_in_file if seen_emails.include?(user[:email])

    ext_id = user[:external_id].presence
    :duplicate_external_id_in_file if ext_id &&
                                      !existing_account_emails.include?(user[:email]) &&
                                      seen_external_ids.include?(ext_id)
  end

  def track_seen_user!(user, seen_emails, seen_external_ids, existing_account_emails)
    seen_emails << user[:email]
    ext_id = user[:external_id].presence
    seen_external_ids << ext_id if ext_id && !existing_account_emails.include?(user[:email])
  end

  # Change all invitees' roles to :student if inviter is a teaching_assistant.
  # Currently our course user roles are not ranked, so invitation's role are restricted
  # such that TAs can only invite students.
  # TODO: When TAs invite non-student roles, skip non-student invitees and alert users
  # instead of silently changing invitee roles.
  #
  # @param [Array<Hash>] users
  # @return [Array<Hash>] users
  def restrict_invitee_role(users)
    users.each { |invitee| invitee[:role] = :student } if @current_course_user&.role == 'teaching_assistant'
    users
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
      { name: name,
        email: value[:email],
        role: value[:role],
        phantom: phantom,
        timeline_algorithm: value[:timeline_algorithm],
        external_id: value[:external_id] }
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
    row_num = 0
    header_map = nil
    blank_header_indices = []
    @blank_header_warning = false
    [].tap do |invites|
      CSV.foreach(file, encoding: 'utf-8').with_index(1) do |row, row_number|
        row_num = row_number
        row[0] = remove_utf8_byte_order_mark(row[0]) if row_number == 1 && row[0]
        row = strip_row(row)
        if row_number == 1
          header_map, blank_header_indices = build_header_map!(row)
          next
        end
        @blank_header_warning ||= blank_header_indices.any? { |idx| row[idx].present? }
        invite = parse_file_row(row, header_map)
        invites << invite if invite
      end
    end
  rescue StandardError => e
    raise CSV::MalformedCSVError.new(e.message, row_num), e.message
  end

  # Strips a row of whitespaces.
  #
  # @param[Array] row Array read from CSV file.
  # @return [Array] Provided row with string stripped of whitespates.
  def strip_row(row)
    row.map { |item| item&.strip }
  end

  def header_alias_map
    @header_alias_map ||= SUPPORTED_LOCALES.each_with_object({}) do |locale, map|
      CANONICAL_COLUMNS.each do |col|
        term = I18n.t("csv.course_user_invitations.headers.#{col}", locale: locale)
        map[normalize_header(term)] = col
      end
    end
  end

  def normalize_header(value)
    value&.strip&.downcase&.gsub(/[\s_\-]+/, '')
  end

  def build_header_map!(row)
    resolved = {}
    blank_indices = []
    row.each_with_index do |cell, idx|
      if cell.blank?
        blank_indices << idx
        next
      end

      canonical = header_alias_map[normalize_header(cell)]
      raise_non_canonical_header_error!(cell) unless canonical
      raise_duplicate_header_error!(canonical) if resolved.key?(canonical)

      resolved[canonical] = idx
    end

    validate_required_headers!(resolved)
    [resolved, blank_indices]
  end

  def raise_non_canonical_header_error!(cell)
    accepted = CANONICAL_COLUMNS.map { |col| I18n.t("csv.course_user_invitations.headers.#{col}") }.join(', ')
    raise I18n.t('errors.course.user_invitations.invalid_headers', header: cell, accepted: accepted)
  end

  def raise_duplicate_header_error!(canonical)
    raise I18n.t('errors.course.user_invitations.duplicate_headers',
                 column: I18n.t("csv.course_user_invitations.headers.#{canonical}"))
  end

  def validate_required_headers!(resolved)
    return if resolved.key?(:name) && resolved.key?(:email)

    raise I18n.t('errors.course.user_invitations.missing_required_headers')
  end

  # Parses the given CSV row (array) and returns attributes for a user invitation.
  #   - Columns are resolved by position via +header_map+, not by fixed order.
  #   - Sets the name as the given email if a name was not provided.
  #
  # @param [Array] row The row's cells as read from the CSV file.
  # @param [Hash{Symbol=>Integer}] header_map Maps each resolved canonical column
  #   (a subset of +CANONICAL_COLUMNS+) to its index in +row+. Only +:name+ and
  #   +:email+ are guaranteed present; optional columns are absent when not in the file.
  # @return [Hash] The parsed invitation attributes given the row.
  def parse_file_row(row, header_map)
    email = row[header_map[:email]]
    return nil if email.blank?

    name = row[header_map[:name]]
    name = email if name.blank?

    role = parse_file_role(row_cell(row, header_map, :role))
    phantom = parse_file_phantom(row_cell(row, header_map, :phantom))
    timeline_algorithm = parse_file_timeline_algorithm(row_cell(row, header_map, :personal_timeline))
    external_id = parse_file_external_id(row_cell(row, header_map, :external_id))

    { name: name, email: email, role: role, phantom: phantom,
      timeline_algorithm: timeline_algorithm, external_id: external_id }
  end

  def row_cell(row, header_map, col)
    idx = header_map[col]
    idx ? row[idx] : nil
  end

  # Parses the role column from the CSV file.
  # This method handles the case where the role is not specified too, where "student" will be assumed.
  #
  # @param [String] role The role as specified in the CSV file
  # @return [Integer] The enum integer for +Course::UserInvitation.role+ matching the input.
  #                   (+Course::UserInvitation.roles[:student]+) is returned by default.
  def parse_file_role(role)
    return :student if role.blank?

    symbol = role.parameterize(separator: '_').to_sym
    symbol || :student
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

  # Parses file value for an invitation's timeline algorithm.
  # Sets timeline algorithm as course default if value is not specified.
  #
  # @param [String|nil] Timeline algorithm as specified in the CSV file.
  # @return [Integer] The enum integer for +Course::UserInvitation.timeline_algorithm+ matching the input.
  #                   current_course.default_timeline_algorithm is returned by default.
  def parse_file_timeline_algorithm(timeline_algorithm)
    return @current_course.default_timeline_algorithm if timeline_algorithm.blank?

    symbol = timeline_algorithm.parameterize(separator: '_').to_sym
    symbol || @current_course.default_timeline_algorithm
  end

  # Parses file value for an invitation's external ID.
  # Returns nil if value is not specified.
  #
  # @param [String|nil] external_id External ID as specified in the CSV file.
  # @return [String|nil] The external ID string, or nil if blank.
  def parse_file_external_id(external_id)
    return nil if external_id.blank?

    external_id
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
