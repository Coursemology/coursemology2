class Course::Assessment::Controller < Course::ComponentController
  load_and_authorize_resource :assessment, through: :course, class: Course::Assessment.name,
                                           unless: :assessments_controller
  add_breadcrumb :index, :course_assessments_path

  protected

  def assessments_controller
    false
  end
end
