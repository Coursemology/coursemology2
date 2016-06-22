# frozen_string_literal: true
class Course::AssessmentsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.assessments.name')
  end

  def sidebar_items
    main_sidebar_items + admin_sidebar_items + admin_settings_items
  end

  private

  def main_sidebar_items
    assessment_categories + assessment_submissions
  end

  def assessment_categories
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

  def assessment_submissions
    [
      {
        key: :assessments_submissions,
        title: t('course.assessment.submissions.sidebar_title'),
        weight: 2,
        path: course_submissions_path(current_course,
                                      category: current_course.assessment_categories.first)
      }
    ]
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
        weight: 3,
        path: course_admin_assessments_path(current_course)
      }
    ]
  end
end
