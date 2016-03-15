# frozen_string_literal: true
class Course::LeaderboardSettings
  include ActiveModel::Model
  include ActiveModel::Conversion
  include ActiveModel::Validations

  validates :display_user_count, numericality: { greater_than_or_equal_to: 0 }

  # Initialises the settings adapter
  #
  # @param [#settings] settings The settings object provided by the settings_on_rails gem.
  def initialize(settings)
    @settings = settings
  end

  # Returns the title of leaderboard component
  #
  # @return [String] The custom or default title of leaderboard component
  def title
    @settings.title
  end

  # Sets the title of leaderboard component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil unless title.present?
    @settings.title = title
  end

  # Returns the number of users to be displayed on the leaderboard
  #
  # @return [Integer] The number of users to be displayed
  def display_user_count
    @settings.display_user_count || 30
  end

  # Returns the number of users to be displayed on the leaderboard
  #
  # @param [Integer] count The number of users to be displayed
  def display_user_count=(count)
    @settings.display_user_count = count
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
