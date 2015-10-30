class Course::ForumsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  def settings
    @settings ||= Course::ForumSettings.new(current_course.settings(:forum))
  end

  private

  def main_sidebar_items
    [
      {
        key: :forums,
        title: settings.title || t('course.forum.forums.sidebar_title'),
        weight: 5,
        path: course_forums_path(current_course),
        unread: unread_count
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        title: settings.title || t('course.forum.forums.sidebar_title'),
        type: :settings,
        weight: 5,
        path: course_admin_forums_path(current_course)
      }
    ]
  end

  def unread_count
    # :TODO
    0
  end
end
