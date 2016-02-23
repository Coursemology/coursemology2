# frozen_string_literal: true
module Course::ExperiencePointsRecordsHelper
  # Name of the awarder of a +Course::ExperiencePointsRecord+.
  # Where it is available, prefer using the awarder's +CourseUser+ name.
  #
  # @return [String]
  def awarder_name(record)
    awarder = record.creator.course_users.find_by(course: record.course_user.course) ||
              record.creator
    awarder.name
  end
end
