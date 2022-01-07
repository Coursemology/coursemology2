# frozen_string_literal: true
module Course::LessonPlanAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_registered_users_showing_milestones_items
      allow_course_staff_show_items if course_user.staff?
      allow_course_teaching_staff_manage_lesson_plans if course_user.teaching_staff?
      allow_own_users_to_ignore_own_todos
    end

    super
  end

  private

  def allow_registered_users_showing_milestones_items
    can :read, Course::LessonPlan::Milestone, lesson_plan_item: { course_id: course.id }
    can :read, Course::LessonPlan::Item, { course_id: course.id, published: true }
    can :read, Course::LessonPlan::Event, lesson_plan_item: { course_id: course.id }
  end

  def allow_course_staff_show_items
    can :read, Course::LessonPlan::Item, course_id: course.id
  end

  def allow_course_teaching_staff_manage_lesson_plans
    can :manage, Course::LessonPlan::Milestone, lesson_plan_item: { course_id: course.id }
    can :manage, Course::LessonPlan::Item, course_id: course.id
    can :manage, Course::LessonPlan::Event, lesson_plan_item: { course_id: course.id }
  end

  def allow_own_users_to_ignore_own_todos
    can :ignore, Course::LessonPlan::Todo, user_id: user.id
  end
end
