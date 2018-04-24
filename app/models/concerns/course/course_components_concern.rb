# frozen_string_literal: true
module Course::CourseComponentsConcern
  extend ActiveSupport::Concern
  include CourseComponentQueryConcern

  def available_components
    @available_components ||= begin
      components = instance.enabled_components
      gamified? ? components : components.reject(&:gamified?)
    end
  end

  def disableable_components
    @disableable_components ||= available_components.select(&:can_be_disabled?)
  end
end
