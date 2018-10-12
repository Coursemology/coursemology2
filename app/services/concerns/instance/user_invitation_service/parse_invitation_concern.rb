# frozen_string_literal: true
# This concern includes methods required to parse the invitations data from a form.
class Instance::UserInvitationService; end
module Instance::UserInvitationService::ParseInvitationConcern
  extend ActiveSupport::Autoload

  private

  # Invites users to the given instance.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [Array<Hash{Symbol=>String}>]
  #   A mutable array of users to add. Each hash must have three attributes:
  #     the +:name+,
  #     the +:email+ of the user to add,
  #     the intended +:role+ in the instance.
  #   The provided +emails+ are NOT case sensitive.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def parse_invitations(users)
    result = parse_from_form(users)
    result.each { |user| user[:email] = user[:email].downcase }
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
      { name: name, email: value[:email], role: value[:role] }
    end
  end
end
