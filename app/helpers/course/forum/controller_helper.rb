# frozen_string_literal: true
module Course::Forum::ControllerHelper
  # Returns next topic link
  # When a forum is specified, it returns the next unread topic in the forum.
  # If there is no unread topic in the forum, it returns next unread topic in another forum.
  # when the forum is not specified, it returns the next unread topic of all forums.
  def next_unread_topic_link(forum = nil)
    all_unread_topics = Course::Forum::Topic.from_course(current_course).
                        accessible_by(current_ability).unread_by(current_user)

    selected_next_topic = nil
    selected_next_topic = all_unread_topics.select { |topic| topic.forum_id == forum.id }.first if forum
    selected_next_topic ||= all_unread_topics.first

    course_forum_topic_path(current_course, selected_next_topic.forum, selected_next_topic) if selected_next_topic
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

  def post_anonymous?(post)
    allow_anonymous = current_course.settings(:course_forums_component).allow_anonymous_post
    is_anonymous = post.is_anonymous && allow_anonymous
    show_creator = (is_anonymous && can?(:view_anonymous, post)) || !is_anonymous

    [is_anonymous, show_creator]
  end
end
