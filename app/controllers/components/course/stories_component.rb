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
      current_course_user.present? &&
      current_component_host[:course_stories_component] &&
      current_course.settings(:course_stories_component).push_key.present?

    student_sidebar_items + staff_sidebar_items
  end

  def student_sidebar_items
    _, open_threads_count = find_or_create_room(current_course_user)

    [
      {
        key: :learn,
        icon: :learn,
        title: settings.title || I18n.t('course.stories.learn'),
        weight: 0,
        path: course_learn_path(current_course),
        unread: open_threads_count
      }
    ]
  rescue Excon::Error::Socket
    []
  end

  def staff_sidebar_items
    return [] unless can?(:access_mission_control, current_course)

    remote_url, pending_threads_count = get_mission_control_url(current_course_user)
    return [] unless remote_url.present?

    [
      {
        key: :mission_control,
        icon: :mission_control,
        type: :admin,
        title: I18n.t('course.stories.mission_control'),
        weight: 1,
        path: course_mission_control_path(current_course),
        unread: pending_threads_count
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
