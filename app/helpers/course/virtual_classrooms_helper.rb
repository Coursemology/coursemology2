# frozen_string_literal: true
module Course::VirtualClassroomsHelper
  # Returns the formatted title of virtual classrooms component.
  #
  # @return [String] The formatted title of virtual classrooms component.
  # @return [nil] If the title is nil.
  def virtual_classrooms_title
    @settings.title.nil? ? nil : format_inline_text(@settings.title)
  end

  # Generate select options for virtual classroom duration
  #
  # @return [[String, Integer]] Formatted select options, starting from 15 minutes,
  #   with a 15-minute interval, up to max_duration (inclusive)
  #   set in virtual_classroom component settings
  def duration_options
    (15..@settings.max_duration.to_i).step(15).map do |i|
      [I18n.t('course.virtual_classrooms.index.duration_minutes', duration: i), i]
    end
  end
end
