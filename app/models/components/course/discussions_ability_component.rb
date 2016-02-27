# frozen_string_literal: true
module Course::DiscussionsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_course_users_show_topics
      allow_course_users_create_posts
    end

    super
  end

  private

  def allow_course_users_show_topics
    can :read, Course::Discussion::Topic
  end

  def allow_course_users_create_posts
    can :create, Course::Discussion::Post
  end
end
