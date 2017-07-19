# frozen_string_literal: true
class Course::Settings::VideosComponent < Course::Settings::Component
  include ActiveModel::Conversion

  # Returns the title of video component
  #
  # @return [String] The custom or default title of video component
  def title
    settings.title
  end

  # Sets the title of video component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil unless title.present?
    settings.title = title
  end
end
