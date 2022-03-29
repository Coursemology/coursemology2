# frozen_string_literal: true
module Course::LearningMapAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_read_learning_map
    end
    super
  end

  private

  def allow_read_learning_map
    can :read, Course::LearningMap, course_id: course.id
  end
end
