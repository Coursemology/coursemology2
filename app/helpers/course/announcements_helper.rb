# frozen_string_literal: true
module Course::AnnouncementsHelper
  # Returns the formatted title of announcements component.
  #
  # @return [String] The formatted title of announcements component.
  # @return [nil] If the title is nil.
  def announcements_title
    @settings.title.nil? ? nil : format_inline_text(@settings.title)
  end
end
