# frozen_string_literal: true
class Course::GradebookController < Course::ComponentController
  before_action :authorize_read_gradebook!

  def index
    @published_assessments = fetch_published_assessments
    assessment_ids = @published_assessments.pluck(:id)
    @students = current_course.course_users.students.without_phantom_users.includes(:user)
    student_ids = @students.pluck(:user_id)
    @assessment_max_grades = Course::Assessment.max_grades(assessment_ids)
    @student_assessment_grades = Course::Assessment::Submission.grade_summary(
      student_ids: student_ids,
      assessment_ids: assessment_ids
    )
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
      includes(:tab).
      joins(tab: :category).
      reorder('course_assessment_categories.weight, course_assessment_tabs.weight, course_assessments.id')
  end
end
