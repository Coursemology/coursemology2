# frozen_string_literal: true
module Course::DiscussionsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_course_users_show_topics
      allow_staff_manage_discussion_topics
      allow_course_users_create_posts
      allow_course_users_update_delete_own_post
    end

    super
  end

  private

  def allow_course_users_show_topics
    can :read, Course::Discussion::Topic, course_all_course_users_hash
  end

  def allow_staff_manage_discussion_topics
    can :manage, Course::Discussion::Topic, course_staff_hash
  end

  def allow_course_users_create_posts
    can :create, Course::Discussion::Post
  end

  def allow_course_users_update_delete_own_post
    can [:update, :destroy], Course::Discussion::Post, creator_id: user.id
  end
end
