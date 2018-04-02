# frozen_string_literal: true
class Course::Settings::VirtualClassroomsComponent < Course::Settings::Component
  include ActiveModel::Conversion

  validates :pagination, numericality: { greater_than: 0 }

  # Returns BrainCert Whiteboard API key of virtual classrooms component
  #
  # @return [String] The custom or default API key for virtual classrooms component
  def braincert_whiteboard_api_key
    settings.braincert_whiteboard_api_key
  end

  # Returns BrainCert timezone of Virtual Classrooms component
  #
  # @return [Integer] The custom or default timezone for virtual classrooms component
  def braincert_whiteboard_timezone
    settings.braincert_whiteboard_timezone || 28 # 28 is GMT
  end

  # Sets BrainCert Whiteboard timezone
  #
  # @return [Integer] The custom or default timezone for virtual classrooms component
  def braincert_whiteboard_timezone=(value)
    settings.braincert_whiteboard_timezone = value
  end

  # Sets BrainCert Whiteboard API key of virtual classrooms component
  #
  # @param [String] value The new API key
  def braincert_whiteboard_api_key=(value)
    settings.braincert_whiteboard_api_key = value
  end

  # Returns BrainCert Virtual Classroom server region
  #
  # @return [String] The custom or default title of virtual classrooms component
  def braincert_server_region
    settings.braincert_server_region || 7 # 7 is code for Singapore
  end

  # Sets BrainCert Virtual Classroom server region
  #
  # @param [String] value The new API key
  def braincert_server_region=(value)
    settings.braincert_server_region = value
  end

  # Returns the title of virtual classrooms component
  #
  # @return [String] The custom or default title of virtual classrooms component
  def title
    settings.title
  end

  # Sets the title of virtual classrooms component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil if title.blank?
    settings.title = title
  end

  # Returns the max duration of virtual classrooms component
  #
  # @return [String] The custom or default max_duration of virtual classrooms component
  def max_duration
    settings.max_duration || 60
  end

  # Sets the max duration of virtual classrooms component
  #
  # @param [String] max_duration The new max duration
  def max_duration=(max_duration)
    max_duration = nil if max_duration.blank?
    settings.max_duration = max_duration
  end

  # Returns the virtual classroom pagination count
  #
  # @return [Integer] The pagination count of virtual classroom
  def pagination
    settings.pagination || 50
  end

  # Sets the virtual classroom pagination number
  #
  # @param [Integer] count The new pagination count
  def pagination=(count)
    settings.pagination = count
  end
end
