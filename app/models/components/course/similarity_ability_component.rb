# frozen_string_literal: true
module Course::SimilarityAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_manage_similarity if course_user&.staff?
    super
  end

  private

  def allow_staff_manage_similarity
    can :manage_similarity, Course, id: course.id
  end
end
