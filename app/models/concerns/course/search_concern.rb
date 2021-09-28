# frozen_string_literal: true
module Course::SearchConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # Search and filter courses by their titles, descriptions or user names.
    # @param [String] keyword The keywords for filtering courses.
    # @return [Array<Course>] The courses which match the keyword. All courses will be returned if
    #   keyword is blank.
    def search(keyword)
      return all if keyword.blank?

      condition = "%#{keyword}%"
      # joining { users.outer }.
      #   where.has { (title =~ condition) | (description =~ condition) | (users.name =~ condition) }.
      #   group('courses.id')
      left_outer_joins(:users).
        where(Course.arel_table[:title].matches(condition).
          or(Course.arel_table[:description].matches(condition)).
          or(User.arel_table[:name].matches(condition))).
        group('courses.id')
    end
  end
end
