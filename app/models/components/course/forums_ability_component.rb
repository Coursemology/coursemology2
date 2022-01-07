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
    allow_show_topics
    allow_create_topics
    allow_update_topics
    allow_reply_unlocked_topics
    allow_resolve_own_topics
  end

  def allow_show_forums
    can [:read, :mark_as_read, :mark_all_as_read, :next_unread, :all_posts], Course::Forum, course_id: course.id
    can [:subscribe, :unsubscribe], Course::Forum, course_id: course.id
  end

  def allow_show_topics
    can [:read, :subscribe], Course::Forum::Topic, topic_course_hash.reverse_merge(hidden: false)
  end

  def allow_create_topics
    can :create, Course::Forum::Topic, topic_course_hash
  end

  def allow_update_topics
    can :update, Course::Forum::Topic, topic_course_hash.reverse_merge(hidden: false, creator: user)
  end

  def allow_reply_unlocked_topics
    can :reply, Course::Forum::Topic, topic_course_hash.reverse_merge(locked: false)
    cannot :reply, Course::Forum::Topic, topic_course_hash.reverse_merge(locked: true)
  end

  def allow_resolve_own_topics
    can :toggle_answer, Course::Forum::Topic, creator_id: user.id
  end

  def define_staff_forum_permissions
    allow_staff_show_all_topics
  end

  def allow_staff_show_all_topics
    can :read, Course::Forum::Topic, topic_course_hash
    can :subscribe, Course::Forum::Topic, topic_course_hash
  end

  def define_teaching_staff_forum_permissions
    allow_teaching_staff_manage_forums
    allow_teaching_staff_manage_topics
  end

  def allow_teaching_staff_manage_forums
    can :manage, Course::Forum, course_id: course.id
  end

  def allow_teaching_staff_manage_topics
    can :manage, Course::Forum::Topic, topic_course_hash
  end
end
