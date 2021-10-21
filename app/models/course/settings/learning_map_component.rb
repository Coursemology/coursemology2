# frozen_string_literal: true
class Course::Settings::LearningMapComponent < Course::Settings::Component
  def self.component_class
    Course::LearningMapComponent
  end

  def title
    settings.title
  end

  def title=(title)
    title = nil if title.blank?
    settings.title = title
  end
end
