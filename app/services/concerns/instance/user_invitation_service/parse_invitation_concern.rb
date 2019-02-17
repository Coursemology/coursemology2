# frozen_string_literal: true
# This concern includes methods required to parse the invitations data from a form.
class Instance::UserInvitationService; end
module Instance::UserInvitationService::ParseInvitationConcern
  extend ActiveSupport::Autoload

  private

  # Invites users to the given instance.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [
  #   [Array<Hash{Symbol=>String}>],
  #   [Array<Hash>]
  # ]
  #   A mutable array of users to add. Each hash must have three attributes:
  #     the +:name+,
  #     the +:email+ of the user to add,
  #     the intended +:role+ in the instance.
  #   The provided +emails+ are NOT case sensitive.
  #   The second subarray contains the leftover duplicate users.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def parse_invitations(users)
    result = parse_from_form(users)
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
      { name: name, email: value[:email], role: value[:role] }
    end
  end
end
