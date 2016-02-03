# frozen_string_literal: true
module Course::SearchConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # Search and filter courses by their titles, descriptions or user names.
    # @param [String] keywords The keywords for filtering courses.
    # @return [Array<Course>] The courses which match the keyword. All courses will be returned if
    #   keyword is blank.
    def search(keyword) # rubocop:disable Metrics/AbcSize
      return all if keyword.blank?

      condition = "%#{keyword}%"
      joins { users.outer }.
        where { (title =~ condition) | (description =~ condition) | (users.name =~ condition) }.
        group { courses.id }
    end
  end
end
