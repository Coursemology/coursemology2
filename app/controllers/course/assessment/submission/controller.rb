# frozen_string_literal: true
class Course::Assessment::Submission::Controller < Course::Assessment::Controller
  load_and_authorize_resource :submission, class: Course::Assessment::Submission.name,
                                           through: :assessment
  before_action :add_assessment_breadcrumb

  protected

  def add_assessment_breadcrumb
    add_breadcrumb(@assessment.title, course_assessment_path(current_course, @assessment))
  end
end
