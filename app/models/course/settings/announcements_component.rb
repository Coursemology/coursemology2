# frozen_string_literal: true
class Course::Settings::AnnouncementsComponent < Course::Settings::Component
  include ActiveModel::Conversion

  validates :pagination, numericality: { greater_than: 0 }

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

  # Returns the announcement pagination count
  #
  # @return [Integer] The pagination count of announcement
  def pagination
    settings.pagination || 50
  end

  # Sets the announcement pagination number
  #
  # @param [Integer] count The new pagination count
  def pagination=(count)
    settings.pagination = count
  end
end
