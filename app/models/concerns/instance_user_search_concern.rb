# frozen_string_literal: true
module InstanceUserSearchConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # Search and filter users by their names or emails.
    #
    # @param [String] keyword The keywords for filtering users.
    # @return [Array<User>] The users which match the keyword. All users will be returned if
    #   keyword is blank.
    def search(keyword) # rubocop:disable Metrics/AbcSize
      return all if keyword.blank?

      condition = "%#{keyword}%"
      joining { user.emails.outer }.
        where.has { (sql('users.name') =~ condition) | (sql('user_emails.email') =~ condition) }.
        group('instance_users.id')
    end
  end
end
