module Course::LessonPlanAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_registered_users_showing_milestones_items
    end

    super
  end

  private

  def allow_registered_users_showing_milestones_items
    can :read, Course::LessonPlan::Milestone, course_all_course_users_hash
    can :read, Course::LessonPlan::Item, course_all_course_users_hash
    can :read, Course::LessonPlan::Event, lesson_plan_item: course_all_course_users_hash
  end
end
