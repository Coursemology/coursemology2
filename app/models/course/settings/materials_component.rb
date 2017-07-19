# frozen_string_literal: true
class Course::Settings::MaterialsComponent < Course::Settings::Component
  include ActiveModel::Conversion

  # Returns the title of materials component
  #
  # @return [String] The custom or default title of announcements component
  def title
    settings.title
  end

  # Sets the title of materials component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil if title.blank?
    settings.title = title
  end
end
