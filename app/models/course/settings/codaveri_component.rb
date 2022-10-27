# frozen_string_literal: true
class Course::Settings::CodaveriComponent < Course::Settings::Component
  include ActiveModel::Conversion

  def self.component_class
    Course::CodaveriComponent
  end

  # Returns the title of forums component
  #
  # @return [String] The custom or default title of forums component
  def is_only_itsp
    settings.is_only_itsp
  end

  # Sets the title of forums component
  #
  # @param [String] title The new title
  def is_only_itsp=(is_only_itsp)
    is_only_itsp = nil if is_only_itsp.blank?
    settings.is_only_itsp = is_only_itsp
  end
end
