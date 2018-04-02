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
end
