# frozen_string_literal: true
class Course::Discussion::TopicsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::UnreadCountsConcern

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :discussion_topics,
        icon: :comments,
        title: settings.title,
        weight: 5,
        path: course_topics_path(current_course),
        unread: unread_comments_count
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        key: :sidebar_discussion_topics,
        title: settings.title,
        type: :settings,
        weight: 7,
        path: course_admin_topics_path(current_course)
      }
    ]
  end
end
