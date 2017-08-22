# frozen_string_literal: true
module Course::ForumsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_students_show_forums
      allow_students_show_topics
      allow_students_create_topics
      allow_students_update_topics
      allow_student_reply_unlocked_topics
      allow_staff_manage_forums
      allow_staff_manage_topics
    end

    super
  end

  private

  def topic_all_course_users_hash
    { forum: course_all_course_users_hash }
  end

  def topic_course_staff_hash
    { forum: course_staff_hash }
  end

  def allow_students_show_forums
    can [:read, :mark_as_read], Course::Forum, course_all_course_users_hash
    can [:subscribe, :unsubscribe], Course::Forum, course_all_course_users_hash
  end

  def allow_students_show_topics
    can :read, Course::Forum::Topic, topic_all_course_users_hash.reverse_merge(hidden: false)
    can :subscribe, Course::Forum::Topic, topic_all_course_users_hash.reverse_merge(hidden: false)
  end

  def allow_students_create_topics
    can :create, Course::Forum::Topic, topic_all_course_users_hash
  end

  def allow_students_update_topics
    can :update, Course::Forum::Topic, topic_all_course_users_hash.reverse_merge(hidden: false,
                                                                                 creator: user)
  end

  def allow_student_reply_unlocked_topics
    can :reply, Course::Forum::Topic, topic_all_course_users_hash.reverse_merge(locked: false)
    cannot :reply, Course::Forum::Topic, topic_all_course_users_hash.reverse_merge(locked: true)
  end

  def allow_staff_manage_forums
    can :manage, Course::Forum, course_staff_hash
  end

  def allow_staff_manage_topics
    can :manage, Course::Forum::Topic, topic_course_staff_hash
  end
end
