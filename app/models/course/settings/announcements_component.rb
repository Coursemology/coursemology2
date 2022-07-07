# frozen_string_literal: true
class Course::Settings::AnnouncementsComponent < Course::Settings::Component
  include ActiveModel::Conversion

  def self.component_class
    Course::AnnouncementsComponent
  end

  # Returns the title of announcements component
  #
  # @return [String] The custom or default title of announcements component
  def title
    settings.title
  end

  # Sets the title of announcements component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil if title.blank?
    settings.title = title
  end
end
