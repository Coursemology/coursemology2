# frozen_string_literal: true
#
# This serves as a base class for course settings models that are associated with
# a course component.
#
class Course::Settings::Component < SimpleDelegator
  include ActiveModel::Validations

  # Update settings with the hash attributes
  #
  # @param [Hash] attributes The hash for the new settings
  def update(attributes)
    attributes.each { |k, v| public_send("#{k}=", v) }
    valid?
  end

  # TODO: Remove once all setting forms have been ported to React
  def persisted?
    true
  end

  private

  def settings
    @settings ||= current_course.settings(key)
  end
end
