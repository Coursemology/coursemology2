# frozen_string_literal: true
module Course::Forum::ControllerHelper
  def next_unread_topic_link
    topic = Course::Forum::Topic.from_course(current_course).
            accessible_by(current_ability).unread_by(current_user).first

    course_forum_topic_path(current_course, topic.forum, topic) if topic
  end

  def email_setting_enabled(component, setting)
    current_course.email_enabled(component, setting)
  end

  def email_setting_enabled_current_course_user(component, setting)
    is_enabled_as_phantom = current_course_user&.phantom? && email_setting_enabled(component, setting).phantom
    is_enabled_as_regular = !current_course_user&.phantom? && email_setting_enabled(component, setting).regular
    is_enabled_as_phantom || is_enabled_as_regular
  end

  def email_subscription_enabled_current_course_user(component, setting)
    !current_course_user&.
      email_unsubscriptions&.
      where(course_settings_email_id: email_setting_enabled(component, setting).id)&.exists?
  end

  def topic_type_keys(topic)
    topic_type_keys = Course::Forum::Topic.topic_types.keys
    topic_type_keys -= ['announcement'] unless can?(:set_announcement, topic)
    topic_type_keys -= ['sticky'] unless can?(:set_sticky, topic)
    topic_type_keys
  end
end
