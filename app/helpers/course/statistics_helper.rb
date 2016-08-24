# frozen_string_literal: true
module Course::StatisticsHelper
  # From the given collection of tutors, find all managers of the groups that the given student
  # is a part of.
  #
  # @param [CourseUser] student The given CoruseUser
  # @param [Array<CourseUser>] tutors Collection of tutors to search within
  # @return [String] Comma-delimited list of tutors names
  def tutors_of(student, tutors)
    student.groups.map do |group|
      tutors.select do |tutor|
        tutor.group_users.select do |group_user|
          group_user.manager? && group_user.group_id == group.id
        end.present?
      end
    end.flatten.uniq.map(&:name).join(', ')
  end
end
