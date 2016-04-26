# frozen_string_literal: true
class Course::PointsDisbursementComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    return [] unless can_create_experience_points_record?

    [
      {
        title: t('course.experience_points_disbursement.sidebar_title'),
        type: :admin,
        weight: 2,
        path: disburse_experience_points_course_users_path(current_course)
      }
    ]
  end

  private

  def can_create_experience_points_record?
    can?(:create, Course::ExperiencePointsRecord.
                    new(course_user: CourseUser.new(course: current_course)))
  end
end
