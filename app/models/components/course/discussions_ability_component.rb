# frozen_string_literal: true
module Course::DiscussionsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_course_users_show_topics
      allow_course_users_mark_topics_as_read
      allow_course_teaching_staff_manage_discussion_topics
      allow_course_users_create_posts
      allow_course_users_reply_and_vote_posts
      allow_course_teaching_staff_manage_posts if course_user.teaching_staff?
      allow_course_users_update_delete_own_post
    end

    super
  end

  private

  def allow_course_users_show_topics
    can [:read, :pending, :all], Course::Discussion::Topic, course_id: course.id
  end

  def allow_course_users_mark_topics_as_read
    can :mark_as_read, Course::Discussion::Topic, course_id: course.id
  end

  def allow_course_teaching_staff_manage_discussion_topics
    can :manage, Course::Discussion::Topic, course_teaching_staff_hash
  end

  def allow_course_users_create_posts
    can :create, Course::Discussion::Post
  end

  def allow_course_users_reply_and_vote_posts
    can [:reply, :vote], Course::Discussion::Post, topic: { course_id: course.id }
  end

  def allow_course_teaching_staff_manage_posts
    can :manage, Course::Discussion::Post, topic: { course_id: course.id }
  end

  def allow_course_users_update_delete_own_post
    can [:update, :destroy], Course::Discussion::Post, creator_id: user.id
    cannot [:update, :destroy], Course::Discussion::Post do |post|
      post.creator_id != user.id
    end
  end
end
