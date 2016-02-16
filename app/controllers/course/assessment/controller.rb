class Course::Assessment::Controller < Course::ComponentController
  before_action :load_and_authorize_assessment
  add_breadcrumb :index, :course_assessments_path

  protected

  # Callback to allow extra parameters to be provided to Cancancan when loading the Assessment
  # resource.
  def load_assessment_options
    {}
  end

  private

  def load_and_authorize_assessment
    options = load_assessment_options.reverse_merge(through: :course,
                                                    class: Course::Assessment.name)
    self.class.cancan_resource_class.new(self, :assessment, options).load_and_authorize_resource
  end
end
