module UserSearchConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # Search and filter users by their names or emails.
    #
    # @param [String] keywords The keywords for filtering users.
    # @return [Array<User>] The users which match the keyword. All users will be returned if
    #   keyword is blank.
    def search(keyword)
      return all if keyword.blank?

      condition = "%#{keyword}%"
      joins { emails.outer }.
        where { (name =~ condition) | (emails.email =~ condition) }.
        group { users.id }
    end
  end
end
