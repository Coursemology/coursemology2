# frozen_string_literal: true
class Course::AnnouncementsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::UnreadCountsConcern

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :announcements,
        icon: :announcement,
        title: settings.title,
        weight: 1,
        path: course_announcements_path(current_course),
        unread: unread_announcements_count
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        key: self.class.key,
        title: settings.title,
        type: :settings,
        weight: 4,
        path: course_admin_announcements_path(current_course)
      }
    ]
  end
end
