# frozen_string_literal: true
class Course::Assessment::Controller < Course::ComponentController
  before_action :load_and_authorize_assessment
  before_action :add_assessment_breadcrumbs

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

  def load_and_authorize_assessment
    options = load_assessment_options.reverse_merge(through: :course,
                                                    class: Course::Assessment.name)
    self.class.cancan_resource_class.new(self, :assessment, options).load_and_authorize_resource
  end

  def add_assessment_breadcrumbs
    category_path = course_assessments_path(course_id: current_course, category: category)
    add_breadcrumb(category.title, category_path)

    add_assessment_tab_breadcrumb
  end

  def add_assessment_tab_breadcrumb
    return if category.tabs.length == 1

    tab_path = course_assessments_path(course_id: current_course, category: category, tab: tab)
    add_breadcrumb(tab.title, tab_path)
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
