class Course::Assessment::Controller < Course::ComponentController
  load_and_authorize_resource :assessment, through: :course, class: Course::Assessment.name,
                                           unless: :assessments_controller

  protected

  def assessments_controller
    false
  end
end
