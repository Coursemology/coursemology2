# frozen_string_literal: true
class Course::StoriesComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::CikgoChatsConcern

  def self.display_name
    I18n.t('components.stories.name')
  end

  def self.enabled_by_default?
    false
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    return [] unless
      current_component_host[:course_stories_component] &&
      current_course.settings(:course_stories_component).push_key.present?

    _, open_threads_count = find_or_create_room(current_course_user)

    [
      {
        key: :learn,
        icon: :learn,
        title: I18n.t('course.stories.learn'),
        weight: 0,
        path: course_learn_path(current_course),
        unread: open_threads_count
      }
    ]
  rescue Excon::Error::Socket
    []
  end

  def settings_sidebar_items
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
