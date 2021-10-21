# frozen_string_literal: true
class Course::LearningMapComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.learning_map.name')
  end

  def sidebar_items
    [
      {
        key: :learning_map,
        icon: 'map',
        title: t('layouts.learning_map.title'),
        weight: 5,
        path: course_learning_map_path(current_course)
      }
    ]
  end
end
