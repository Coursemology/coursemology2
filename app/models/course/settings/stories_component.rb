# frozen_string_literal: true
class Course::Settings::StoriesComponent < Course::Settings::Component
  include ActiveModel::Conversion

  def push_key
    settings.push_key
  end

  def push_key=(push_key)
    push_key = push_key.presence
    settings.push_key = push_key
  end

  def title
    settings.title
  end

  def title=(title)
    title = nil if title.blank?
    settings.title = title
  end
end
