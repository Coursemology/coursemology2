# frozen_string_literal: true
class Course::Settings::VirtualClassroomsComponent
  include ActiveModel::Model
  include ActiveModel::Conversion
  include ActiveModel::Validations

  validates :pagination, numericality: { greater_than: 0 }

  # Initialises the settings adapter
  #
  # @param [#settings] settings The settings object provided by the settings_on_rails gem.
  def initialize(settings)
    @settings = settings
  end

  # Returns BrainCert Whiteboard API key of virtual classrooms component
  #
  # @return [String] The custom or default API key for virtual classrooms component
  def braincert_whiteboard_api_key
    @settings.braincert_whiteboard_api_key
  end

  # Returns BrainCert timezone of Virtual Classrooms component
  #
  # @return [Integer] The custom or default timezone for virtual classrooms component
  def braincert_whiteboard_timezone
    @settings.braincert_whiteboard_timezone || 28 # 28 is GMT
  end

  # Sets BrainCert Whiteboard timezone
  #
  # @return [Integer] The custom or default timezone for virtual classrooms component
  def braincert_whiteboard_timezone=(value)
    @settings.braincert_whiteboard_timezone = value
  end

  # Sets BrainCert Whiteboard API key of virtual classrooms component
  #
  # @param [String] value The new API key
  def braincert_whiteboard_api_key=(value)
    @settings.braincert_whiteboard_api_key = value
  end

  # Returns BrainCert Virtual Classroom server region
  #
  # @return [String] The custom or default title of virtual classrooms component
  def braincert_server_region
    @settings.braincert_server_region || 7 # 7 is code for Singapore
  end

  # Sets BrainCert Virtual Classroom server region
  #
  # @param [String] value The new API key
  def braincert_server_region=(value)
    @settings.braincert_server_region = value
  end

  # Returns the title of virtual classrooms component
  #
  # @return [String] The custom or default title of virtual classrooms component
  def title
    @settings.title
  end

  # Sets the title of virtual classrooms component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil unless title.present?
    @settings.title = title
  end

  # Returns the max duration of virtual classrooms component
  #
  # @return [String] The custom or default max_duration of virtual classrooms component
  def max_duration
    @settings.max_duration || 60
  end

  # Sets the max duration of virtual classrooms component
  #
  # @param [String] max_duration The new max duration
  def max_duration=(max_duration)
    max_duration = nil unless max_duration.present?
    @settings.max_duration = max_duration
  end

  # Returns the virtual classroom pagination count
  #
  # @return [Integer] The pagination count of virtual classroom
  def pagination
    @settings.pagination || 50
  end

  # Sets the virtual classroom pagination number
  #
  # @param [Integer] count The new pagination count
  def pagination=(count)
    @settings.pagination = count
  end

  # Update settings with the hash attributes
  #
  # @param [Hash] attributes The hash who stores the new settings
  def update(attributes)
    attributes.each { |k, v| send("#{k}=", v) }
    valid?
  end

  def persisted? #:nodoc:
    true
  end
end
