# frozen_string_literal: true
module Course::AchievementsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_read_achievements
      allow_user_with_achievement_show_badges

      allow_read_draft_achievements_and_display_badge if course_user.staff?
      allow_manage_achievements if course_user.teaching_staff?
    end

    do_not_allow_award_automatically_awarded_achievements

    super
  end

  private

  def allow_read_achievements
    can :read, Course::Achievement, course_id: course.id, published: true
  end

  def allow_user_with_achievement_show_badges
    can :display_badge, Course::Achievement, course_user_achievements: { course_user_id: course_user.id }
  end

  def allow_read_draft_achievements_and_display_badge
    can [:read, :display_badge], Course::Achievement, course_id: course.id
  end

  def allow_manage_achievements
    can :manage, Course::Achievement, course_id: course.id
  end

  def do_not_allow_award_automatically_awarded_achievements
    cannot :award, Course::Achievement do |achievement|
      !achievement.manually_awarded?
    end
  end
end
