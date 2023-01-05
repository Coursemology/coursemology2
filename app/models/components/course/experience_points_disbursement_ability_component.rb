# frozen_string_literal: true
module Course::ExperiencePointsDisbursementAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_disburse_experience_points if course_user&.teaching_staff?

    super
  end

  private

  def allow_staff_disburse_experience_points
    can :disburse, Course::ExperiencePoints::Disbursement
    can :disburse, Course::ExperiencePoints::ForumDisbursement
  end
end
