# frozen_string_literal: true
class Course::ExperiencePointsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.gamified?
    true
  end

  def sidebar_items
    return [] unless can_create_experience_points_record?

    [
      {
        key: :sidebar_experience_points,
        icon: :experience,
        type: :admin,
        weight: 4,
        path: course_experience_points_records_path(current_course)
      }
    ]
  end

  private

  def can_create_experience_points_record?
    can?(:create, Course::ExperiencePointsRecord.
                    new(course_user: CourseUser.new(course: current_course)))
  end
end
