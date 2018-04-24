# frozen_string_literal: true
class Course::ComponentController < Course::Controller
  layout 'course'

  before_action :load_current_component_host
  before_action :check_component
  before_action :load_settings

  private

  # Forces the current component host to be loaded. This is used in the Course layout to decide
  # which navbar items to display, so count it under the Controller's execution time instead.
  def load_current_component_host
    current_component_host
  end

  # Check if the component is enabled. We don't want to let user access the page through url if the
  # component is disabled.
  #
  # @raise [Coursemology::ComponentNotFoundError] When the component is disabled.
  def check_component
    raise ComponentNotFoundError unless component
  end

  # Load current component's settings
  def load_settings
    @settings = component.settings
  end

  # This is meant to be overriden by child classes that inherit from this class.
  # If the controller doesn't belong to a component, it can inherit directly from Course::Controller.
  #
  # @raise [Coursemology::ComponentNotFoundError]
  # @return [Course::ControllerComponentHost::Component]
  def component
    raise ComponentNotFoundError
  end
end
