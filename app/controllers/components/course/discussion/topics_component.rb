# frozen_string_literal: true
class Course::Discussion::TopicsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component
  include Course::Discussion::TopicsHelper

  def self.display_name
    I18n.t('components.discussion.topics.name')
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :discussion_topics,
        icon: 'comments',
        title: settings.title || t('course.discussion.topics.sidebar_title'),
        weight: 5,
        path: sidebar_path,
        unread: unread_count
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        title: t('course.discussion.topics.sidebar_title'),
        type: :settings,
        weight: 4,
        path: course_admin_topics_path(current_course)
      }
    ]
  end

  def sidebar_path
    if staff_with_students?
      my_students_pending_course_topics_path(current_course)
    elsif staff?
      pending_course_topics_path(current_course)
    else
      course_topics_path(current_course)
    end
  end

  def unread_count
    if staff_with_students?
      my_students_unread_count
    elsif staff?
      all_unread_count
    else
      0
    end
  end

  def staff_with_students?
    current_course_user && current_course_user.staff? && !current_course_user.my_students.empty?
  end

  def staff?
    current_course_user && current_course_user.staff?
  end
end
