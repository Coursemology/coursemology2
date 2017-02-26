# frozen_string_literal: true
module Course::LecturesHelper
  # Returns the formatted title of lectures component.
  #
  # @return [String] The formatted title of lectures component.
  # @return [nil] If the title is nil.
  def lectures_title
    @settings.title.nil? ? nil : format_inline_text(@settings.title)
  end
end
