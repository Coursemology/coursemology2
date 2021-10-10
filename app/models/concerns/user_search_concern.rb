# frozen_string_literal: true
module UserSearchConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # Search and filter users by their names or emails.
    #
    # @param [String] keyword The keywords for filtering users.
    # @return [Array<User>] The users which match the keyword. All users will be returned if
    #   keyword is blank.
    def search(keyword)
      return all if keyword.blank?

      condition = "%#{keyword}%"
      # joining { emails.outer }.
      #   where.has { (name =~ condition) | (emails.email =~ condition) }.
      #   group('users.id')

      left_outer_joins(:emails).
        where(User.arel_table[:name].matches(condition).
          or(User::Email.arel_table[:email].matches(condition))).
        group('users.id')
    end
  end
end
