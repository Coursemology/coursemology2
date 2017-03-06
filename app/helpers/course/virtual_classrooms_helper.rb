# frozen_string_literal: true
module Course::VirtualClassroomsHelper
  # Returns the formatted title of virtual classrooms component.
  #
  # @return [String] The formatted title of virtual classrooms component.
  # @return [nil] If the title is nil.
  def virtual_classrooms_title
    @settings.title.nil? ? nil : format_inline_text(@settings.title)
  end
end
