module Course::AnnouncementsHelper
  # Returns the formatted title of announcements component.
  #
  # @return [String|nil] The formatted title of announcements component, or nil if the title is nil.
  def announcements_title
    @announcement_settings.title.nil? ? nil : format_inline_text(@announcement_settings.title)
  end
end
