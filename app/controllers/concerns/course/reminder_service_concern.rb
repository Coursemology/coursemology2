# frozen_string_literal: true
module Course::ReminderServiceConcern
  extend ActiveSupport::Concern

  # Converts a set of course users to a string, with each name on a new line.
  # Sorts the names alphabetically and prepends an index number to each name.
  #
  # @param [Array<CourseUser>] course_users The array of course users to turn into a list.
  # @return [String] The numbered list of course users.
  def name_list(course_users)
    course_users_names = course_users.to_a.map(&:name).sort!
    course_users_names.each_with_index do |course_user, index|
      course_users_names[index] = "#{index + 1}. #{course_user}"
    end.join("\n")
  end
end
