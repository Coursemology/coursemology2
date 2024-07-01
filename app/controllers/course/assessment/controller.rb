# frozen_string_literal: true
class Course::Assessment::Controller < Course::ComponentController
  before_action :load_and_authorize_assessment
  before_action :load_category_and_tab

  protected

  # Callback to allow extra parameters to be provided to Cancancan when loading the Assessment
  # resource.
  def load_assessment_options
    {}
  end

  def category
    @category ||= tab.category
  end

  def tab
    @tab ||= @assessment.tab
  end

  private

  def load_category_and_tab
    category
    tab
  end

  def load_and_authorize_assessment
    options = load_assessment_options.reverse_merge(through: :course,
                                                    class: 'Course::Assessment')
    self.class.cancan_resource_class.new(self, :assessment, options).load_and_authorize_resource
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
