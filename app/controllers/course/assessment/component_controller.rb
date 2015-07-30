class Course::Assessment::ComponentController < Course::Assessment::Controller
  before_action :add_assessment_breadcrumb

  protected

  def add_assessment_breadcrumb
    add_breadcrumb @assessment.title, course_assessment_path(current_course, @assessment)
  end
end
