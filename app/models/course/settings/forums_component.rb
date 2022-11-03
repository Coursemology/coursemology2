# frozen_string_literal: true
class Course::Settings::ForumsComponent < Course::Settings::Component
  include ActiveModel::Conversion

  validates :pagination, numericality: { greater_than: 0 }

  FORUM_POST_MARK_ANSWER_USER_VALUES = %w[creator_only everyone].freeze

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

  # Returns the user type that can mark/unmark post as answer
  #
  # @return [Integer] The pagination count of forum
  def mark_post_as_answer_setting
    settings.mark_post_as_answer_setting || 'creator_only'
  end

  # Sets which user type that can mark/unmark forum post as answer.
  #
  # @return [String] The new setting
  def mark_post_as_answer_setting=(setting)
    raise ArgumentError, 'Invalid user type to mark/unmark post as answer setting.' \
      unless FORUM_POST_MARK_ANSWER_USER_VALUES.include?(setting)

    settings.mark_post_as_answer_setting = setting
  end
end
