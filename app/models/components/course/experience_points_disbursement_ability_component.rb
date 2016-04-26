# frozen_string_literal: true
module Course::ExperiencePointsDisbursementAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_disburse_experience_points if user

    super
  end

  private

  def allow_staff_disburse_experience_points
    can :disburse, Course::ExperiencePointsDisbursement, course_staff_hash
  end
end
