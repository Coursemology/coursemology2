# frozen_string_literal: true
class Course::AssessmentsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    main_sidebar_items + admin_sidebar_items + admin_settings_items
  end

  private

  def main_sidebar_items
    current_course.assessment_categories.select(&:persisted?).map do |category|
      {
        key: :assessments,
        title: category.title,
        weight: 2,
        path: course_assessments_path(current_course, category: category, tab: category.tabs.first),
        unread: 0
      }
    end
  end

  def admin_sidebar_items
    return [] unless can?(:manage, Course::Assessment::Skill.new(course: current_course))

    [
      {
        key: :assessments_skills,
        title: t('course.assessment.skills.sidebar_title'),
        type: :admin,
        weight: 3,
        path: course_assessments_skills_path(current_course)
      }
    ]
  end

  def admin_settings_items
    [
      {
        title: t('course.assessment.assessments.sidebar_title'),
        type: :settings,
        weight: 6,
        path: course_admin_assessments_path(current_course)
      }
    ]
  end
end
