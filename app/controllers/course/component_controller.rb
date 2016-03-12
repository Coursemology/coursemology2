# frozen_string_literal: true
class Course::ComponentController < Course::Controller
  layout 'course'

  before_action :load_current_component_host

  private

  # Forces the current component host to be loaded. This is used in the Course layout to decide
  # which navbar items to display, so count it under the Controller's execution time instead.
  def load_current_component_host
    current_component_host
  end
end
