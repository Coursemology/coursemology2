# frozen_string_literal: true
module Course::ForumsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      define_all_forum_permissions
      define_staff_forum_permissions if course_user.staff?
      define_teaching_staff_forum_permissions if course_user.teaching_staff?
    end

    super
  end

  private

  def topic_course_hash
    { forum: { course_id: course.id } }
  end

  def define_all_forum_permissions
    allow_show_forums
    allow_show_topics if course_user.student?
    allow_create_topics
    allow_update_topics
    allow_reply_unlocked_topics
    allow_resolve_own_topics
  end

  def allow_show_forums
    can [:read, :mark_as_read, :mark_all_as_read, :all_posts], Course::Forum, course_id: course.id
    can [:subscribe, :unsubscribe], Course::Forum, course_id: course.id
  end

  def allow_show_topics
    can [:read, :subscribe], Course::Forum::Topic, topic_course_hash.reverse_merge(hidden: false)
  end

  def allow_create_topics
    can :create, Course::Forum::Topic, topic_course_hash
  end

  def allow_update_topics
    can :update, Course::Forum::Topic, topic_course_hash.reverse_merge(hidden: false, creator_id: user.id)
  end

  def allow_reply_unlocked_topics
    can :reply, Course::Forum::Topic, topic_course_hash.reverse_merge(locked: false)
    cannot :reply, Course::Forum::Topic, topic_course_hash.reverse_merge(locked: true)
  end

  def allow_resolve_own_topics
    if course.settings(:course_forums_component).mark_post_as_answer_setting == 'everyone'
      can :toggle_answer, Course::Forum::Topic, topic_course_hash
    else
      can :toggle_answer, Course::Forum::Topic, topic_course_hash.reverse_merge(creator_id: user.id)
    end
  end

  def define_staff_forum_permissions
    allow_staff_show_all_topics
    allow_staff_resolve_topics
  end

  def allow_staff_show_all_topics
    can :read, Course::Forum::Topic, topic_course_hash
    can :subscribe, Course::Forum::Topic, topic_course_hash
  end

  def allow_staff_resolve_topics
    can :toggle_answer, Course::Forum::Topic, topic_course_hash
  end

  def define_teaching_staff_forum_permissions
    allow_teaching_staff_manage_forums
    allow_teaching_staff_manage_topics
    allow_manage_ai_responses
  end

  def allow_teaching_staff_manage_forums
    can :manage, Course::Forum, course_id: course.id
  end

  def allow_teaching_staff_manage_topics
    can :manage, Course::Forum::Topic, topic_course_hash
  end

  def allow_manage_ai_responses
    can :publish, Course::Forum::Topic, topic_course_hash
    can :generate_reply, Course::Forum::Topic, topic_course_hash
    can :mark_answer_and_publish, Course::Forum::Topic, topic_course_hash
  end
end
