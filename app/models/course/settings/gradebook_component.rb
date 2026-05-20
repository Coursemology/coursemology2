# frozen_string_literal: true
class Course::Settings::GradebookComponent < Course::Settings::Component
  # Returns whether weighted view is enabled (disabled by default).
  #
  # @return [Boolean] Setting on whether weighted view is enabled.
  def weighted_view_enabled
    ActiveRecord::Type::Boolean.new.cast(settings.weighted_view_enabled) || false
  end

  # Enable or disable the weighted view.
  #
  # @param [Boolean|Integer|String] value Setting on whether weighted view is enabled.
  def weighted_view_enabled=(value)
    settings.weighted_view_enabled = ActiveRecord::Type::Boolean.new.cast(value)
  end
end
