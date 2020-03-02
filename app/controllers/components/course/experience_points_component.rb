# frozen_string_literal: true
class Course::ExperiencePointsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  
  def self.display_name
    I18n.t('components.experience_points.name')
  end

  def sidebar_items
    return [] unless can_create_experience_points_record?

    [
      {
        icon: 'magic',
        title: t('course.experience_points.disbursement.sidebar_title'),
        type: :admin,
        weight: 4,
        path: forum_disbursement_course_users_path(current_course)
      }
    ]
  end

  private

  def can_create_experience_points_record?
    can?(:create, Course::ExperiencePointsRecord.
                    new(course_user: CourseUser.new(course: current_course)))
  end
end
