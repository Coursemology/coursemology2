# frozen_string_literal: true
class Course::Settings::MaterialsComponent
  include ActiveModel::Model
  include ActiveModel::Conversion
  include ActiveModel::Validations

  # Initialises the settings adapter
  #
  # @param [#settings] settings The settings object provided by the settings_on_rails gem.
  def initialize(settings)
    @settings = settings
  end

  # Returns the title of materials component
  #
  # @return [String] The custom or default title of announcements component
  def title
    @settings.title
  end

  # Sets the title of materials component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil if title.blank?
    @settings.title = title
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
