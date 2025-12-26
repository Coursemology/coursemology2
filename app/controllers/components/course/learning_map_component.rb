# frozen_string_literal: true
class Course::LearningMapComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    [
      {
        key: :learning_map,
        icon: :map,
        weight: 5,
        path: course_learning_map_path(current_course)
      }
    ]
  end
end
