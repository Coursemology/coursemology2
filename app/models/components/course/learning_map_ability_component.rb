# frozen_string_literal: true
module Course::LearningMapAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_read_learning_map if course_user
    super
  end

  private

  def allow_read_learning_map
    can :read, Course::LearningMap, course_id: course.id
  end
end
