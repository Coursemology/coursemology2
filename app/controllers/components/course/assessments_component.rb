# frozen_string_literal: true
class Course::AssessmentsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::UnreadCountsConcern

  def self.lesson_plan_item_actable_names
    [Course::Assessment.name]
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
        key: "assessments_#{category.id}",
        icon: :assessment, # TODO: category.icon in db that user can select and set
        title: category.title,
        weight: 2,
        path: course_assessments_path(current_course, category: category)
      }
    end
  end

  def assessment_submissions
    [
      {
        key: :assessments_submissions,
        icon: :submission,
        weight: 3,
        path: course_submissions_path(current_course),
        unread: pending_assessment_submissions_count
      }
    ]
  end

  def admin_sidebar_items
    return [] unless can?(:read, Course::Assessment::Skill.new(course: current_course))

    [
      {
        key: :sidebar_assessments_skills,
        icon: :skills,
        type: :admin,
        weight: 8,
        path: course_assessments_skills_path(current_course)
      }
    ]
  end

  def admin_settings_items
    [
      {
        key: self.class.key,
        type: :settings,
        weight: 5,
        path: course_admin_assessments_path(current_course)
      }
    ]
  end
end
