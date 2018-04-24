# frozen_string_literal: true
module Instance::CourseComponentsConcern
  extend ActiveSupport::Concern
  include CourseComponentQueryConcern

  def available_components
    @available_components ||= Course::ControllerComponentHost.components
  end

  def disableable_components
    @disableable_components ||= available_components.select(&:can_be_disabled?)
  end
end
