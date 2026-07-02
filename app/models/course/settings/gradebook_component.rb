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

  # Returns whether the weighted total is capped at 100% (disabled by default). A
  # gradebook-wide grading policy, so it lives beside weighted_view_enabled.
  #
  # @return [Boolean] Setting on whether the weighted total is capped at 100%.
  def cap_weighted_total
    ActiveRecord::Type::Boolean.new.cast(settings.cap_weighted_total) || false
  end

  # Enable or disable capping the weighted total at 100%.
  #
  # @param [Boolean|Integer|String] value Setting on whether the weighted total is capped.
  def cap_weighted_total=(value)
    settings.cap_weighted_total = ActiveRecord::Type::Boolean.new.cast(value)
  end
end
