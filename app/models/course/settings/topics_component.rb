# frozen_string_literal: true
class Course::Settings::TopicsComponent < Course::Settings::Component
  include ActiveModel::Conversion

  validates :pagination, numericality: { greater_than: 0, less_than_or_equal_to: 50 }

  def title
    settings.title
  end

  def title=(title)
    title = nil if title.blank?
    settings.title = title
  end

  def pagination
    settings.pagination || 10
  end

  def pagination=(count)
    settings.pagination = count
  end

  # Whether AI-generated comments are shown in the staff pending counts and pending lists in the comments
  # centre (see Course::Discussion::TopicsHelper). Defaults to true (coerced from an unset setting),
  # preserving the existing behaviour of surfacing them; unchecking hides topics pending only on unreviewed
  # AI feedback.
  def is_showing_ai_generated_comments # rubocop:disable Naming/PredicatePrefix
    value = settings.is_showing_ai_generated_comments
    value.nil? || value
  end

  def is_showing_ai_generated_comments=(value)
    settings.is_showing_ai_generated_comments = ActiveRecord::Type::Boolean.new.cast(value)
  end
end
