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
        icon: 'plane', # TODO: category.icon in db that user can select and set
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
        icon: 'upload',
        title: t('course.assessment.submissions.sidebar_title'),
        weight: 2,
        path: assessment_submissions_url,
        unread: submission_count
      }
    ]
  end

  def admin_sidebar_items
    return [] unless can?(:manage, Course::Assessment::Skill.new(course: current_course))

    [
      {
        key: :assessments_skills,
        icon: 'bolt',
        title: t('course.assessment.skills.sidebar_title'),
        type: :admin,
        weight: 7,
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

  # Path for the submissions tab based on course_user role:
  #   course_owner & course_manager will be directed to all pending submissions
  #   course_teaching_assistant will be directly to my students' pending submissions
  #   course_user will see all their own submissions.
  #   Other users that can see this (instance admins) will see all submissions in the course.
  def assessment_submissions_url
    if current_course_user && current_course_user.manager_or_owner?
      pending_course_submissions_path(current_course, my_students: false)
    elsif current_course_user && current_course_user.staff?
      pending_course_submissions_path(current_course, my_students: true)
    else
      course_submissions_path(current_course, category: current_course.assessment_categories.first)
    end
  end

  # Returns the number of pending submissions based on roles:
  #   course_teacher_assistant: Number of submissions from students in my group
  #   course_owner & course_manager: Number of pending submissions in the course
  #   course_student or other users: 0
  def submission_count
    if current_course_user && current_course_user.manager_or_owner?
      pending_submissions_count
    elsif current_course_user && current_course_user.staff?
      my_students_pending_submissions_count
    else
      0
    end
  end
end
