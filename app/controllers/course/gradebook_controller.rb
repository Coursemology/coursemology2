# frozen_string_literal: true
class Course::GradebookController < Course::ComponentController
  before_action :authorize_read_gradebook!

  def index
    @published_assessments = fetch_published_assessments
    assessment_ids = @published_assessments.pluck(:id)
    tabs = @published_assessments.map(&:tab).uniq(&:id)
    @categories = tabs.map(&:category).uniq(&:id)
    @tabs = tabs
    current_course.levels.load
    @students = current_course.course_users.students.without_phantom_users.includes(:user)
    student_ids = @students.pluck(:user_id)
    @assessment_max_grades = Course::Assessment.where(id: assessment_ids)
                                              .calculated(:maximum_grade)
                                              .each_with_object({}) { |a, h| h[a.id] = a.maximum_grade }
    @submissions = Course::Assessment::Submission.
      where(assessment_id: assessment_ids, creator_id: student_ids).
      where(workflow_state: [:graded, :published]).
      calculated(:grade)
  end

  private

  def authorize_read_gradebook!
    authorize! :read_gradebook, current_course
  end

  def component
    current_component_host[:course_gradebook_component]
  end

  def fetch_published_assessments
    current_course.assessments.
      published.
      includes(tab: :category).
      joins(tab: :category).
      reorder('course_assessment_categories.weight, course_assessment_tabs.weight, course_assessments.id')
  end
end
