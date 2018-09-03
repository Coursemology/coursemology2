# frozen_string_literal: true
class Course::Settings::ForumsComponent < Course::Settings::Component
  include ActiveModel::Conversion
  include Course::Settings::EmailSettingsConcern

  validates :pagination, numericality: { greater_than: 0 }

  def self.email_setting_items
    {
      post_replied: { enabled_by_default: true },
      post_phantom_replied: { enabled_by_default: true },
      topic_created: { enabled_by_default: true }
    }
  end

  def self.component_class
    Course::ForumsComponent
  end

  # Returns the title of forums component
  #
  # @return [String] The custom or default title of forums component
  def title
    settings.title
  end

  # Sets the title of forums component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil if title.blank?
    settings.title = title
  end

  # Returns the forum pagination count
  #
  # @return [Integer] The pagination count of forum
  def pagination
    settings.pagination || 50
  end

  # Sets the forum pagination number
  #
  # @param [Integer] count The new pagination count
  def pagination=(count)
    settings.pagination = count
  end
end
