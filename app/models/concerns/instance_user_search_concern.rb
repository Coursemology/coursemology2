# frozen_string_literal: true
module InstanceUserSearchConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # Search and filter users by their names or emails.
    #
    # @param [String] keywords The keywords for filtering users.
    # @return [Array<User>] The users which match the keyword. All users will be returned if
    #   keyword is blank.
    def search(keyword) # rubocop:disable Metrics/AbcSize
      return all if keyword.blank?

      condition = "%#{keyword}%"
      joins { user.emails.outer }.
        where { (user.name =~ condition) | (user.emails.email =~ condition) }.
        group { instance_users.id }
    end
  end
end
