# frozen_string_literal: true
class Course::ForumsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::UnreadCountsConcern

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :forums,
        icon: :forum,
        title: settings.title,
        weight: 10,
        path: course_forums_path(current_course),
        unread: unread_forum_topics_count
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        key: self.class.key,
        title: settings.title,
        type: :settings,
        weight: 11,
        path: course_admin_forums_path(current_course)
      }
    ]
  end
end
