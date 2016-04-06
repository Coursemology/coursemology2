# frozen_string_literal: true
module Course::AchievementsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_student_show_achievements
      allow_students_with_achievement_show_badges
      allow_staff_manage_achievements
    end

    super
  end

  private

  def allow_student_show_achievements
    can :read, Course::Achievement,
        course_all_course_users_hash.reverse_merge(published_achievement_hash)
  end

  def allow_staff_manage_achievements
    can :manage, Course::Achievement, course_staff_hash
  end

  def allow_students_with_achievement_show_badges
    can :display_badge, Course::Achievement, course_user_hash
  end

  def published_achievement_hash
    { draft: false }
  end
end
