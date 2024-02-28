# frozen_string_literal: true
class Course::StoriesComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.stories.name')
  end

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    [
      {
        title: I18n.t('components.stories.name'),
        type: :settings,
        weight: 5,
        path: course_admin_stories_path(current_course)
      }
    ]
  end
end
