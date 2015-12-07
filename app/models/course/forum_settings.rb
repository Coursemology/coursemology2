class Course::ForumSettings
  include ActiveModel::Model
  include ActiveModel::Conversion
  include ActiveModel::Validations

  validates :forum_pagination, numericality: { greater_than: 0 }
  validates :topic_pagination, numericality: { greater_than: 0 }

  # Initialises the settings adapter
  #
  # @param [#settings] settings The settings object provided by the settings_on_rails gem.
  def initialize(settings)
    @settings = settings
  end

  # Returns the title of forums component
  #
  # @return [String] The custom or default title of forums component
  def title
    @settings.title
  end

  # Sets the title of forums component
  #
  # @param [String] title The new title
  def title=(title)
    title = nil unless title.present?
    @settings.title = title
  end

  # Returns the title of topics in forums component
  #
  # @return [String] The custom or default title of topics in forums component
  def topic_title
    @settings.topic_title
  end

  # Sets the title of topics in forums component
  #
  # @param [String] title The new title
  def topic_title=(title)
    title = nil unless title.present?
    @settings.topic_title = title
  end

  # Returns the forum pagination count
  #
  # @return [Integer] The pagination count of forum
  def forum_pagination
    @settings.forum_pagination || 50
  end

  # Sets the forum pagination number
  #
  # @param [Integer] count The new pagination count
  def forum_pagination=(count)
    @settings.forum_pagination = count
  end

  # Returns the topic pagination count
  #
  # @return [Integer] The pagination count of topic
  def topic_pagination
    @settings.topic_pagination || 50
  end

  # Sets the topic pagination number
  #
  # @param [Integer] count The new pagination count
  def topic_pagination=(count)
    @settings.topic_pagination = count
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
