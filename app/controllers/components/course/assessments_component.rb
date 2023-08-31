# frozen_string_literal: true
class Course::AssessmentsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::Assessment::SubmissionsHelper

  def self.display_name
    I18n.t('components.assessments.name')
  end

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
        path: course_assessments_path(current_course, category: category),
        unread: 0
      }
    end
  end

  def assessment_submissions
    [
      {
        key: :assessments_submissions,
        icon: :submission,
        title: t('course.assessment.submissions.sidebar_title'),
        weight: 3,
        path: course_submissions_path(current_course),
        unread: submission_count
      }
    ]
  end

  def admin_sidebar_items
    return [] unless can?(:read, Course::Assessment::Skill.new(course: current_course))

    [
      {
        key: :assessments_skills,
        icon: :skills,
        title: t('course.assessment.skills.sidebar_title'),
        type: :admin,
        weight: 8,
        path: course_assessments_skills_path(current_course)
      }
    ]
  end

  def admin_settings_items
    [
      {
        title: t('course.assessment.assessments.sidebar_title'),
        type: :settings,
        weight: 5,
        path: course_admin_assessments_path(current_course)
      }
    ]
  end

  # Returns the number of pending submissions based on roles:
  #   course_teacher_assistant: Number of submissions from students in my group
  #   course_owner & course_manager: Number of submissions from students in my group if it's nonzero,
  #       otherwise number of submissions from all students in the course
  #   course_student or other users: 0
  def submission_count
    if current_course_user&.manager_or_owner?
      my_students_pending_submissions_count > 0 ? my_students_pending_submissions_count : pending_submissions_count
    elsif current_course_user&.staff?
      my_students_pending_submissions_count
    else
      0
    end
  end
end
