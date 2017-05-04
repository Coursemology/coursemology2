# frozen_string_literal: true
module UserSearchConcern
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
      joining { emails.outer }.
        where.has { (name =~ condition) | (emails.email =~ condition) }.
        group('users.id')
    end
  end
end
