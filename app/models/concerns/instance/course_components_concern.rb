# frozen_string_literal: true
module Instance::CourseComponentsConcern
  extend ActiveSupport::Concern
  include CourseComponentQueryConcern

  def available_components
    @available_components ||= Course::ControllerComponentHost.components
  end

  # All components can be disabled at the instance level.
  # If there is a need, `can_be_disabled_for_instance?` can be implemented for components
  # to prevent some components from ever being disabled.
  def disableable_components
    available_components
  end
end
