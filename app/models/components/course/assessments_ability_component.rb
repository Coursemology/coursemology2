# frozen_string_literal: true
module Course::AssessmentsAbilityComponent
  include AbilityHost::Component
  extend ActiveSupport::Concern

  include Course::Assessment::AssessmentAbility
  include Course::Assessment::SkillAbility

  def define_permissions
    if course_user&.manager_or_owner? && course&.is_model_configuration_authorized?
      allow_authorized_course_staff_manage_ai_grading_settings
    end

    super
  end

  private

  # Which model rubric grading runs on, the request options it is sent with, and any system prompt override
  # are operational levers over cost, latency and provider behaviour rather than course content, so by
  # default only system administrators hold them -- they already do, through `can :manage, :all` (see
  # Ability#initialize), which is why nothing is granted for them here. Instance administrators deliberately
  # do not get them. A course's own managers and owners hold them only for a course a system admin has
  # opened up, which Course#is_model_configuration_authorized records (see
  # Course::Admin::AdminController#authorize_model_configuration).
  #
  # The subject is a symbol rather than Course on purpose -- course managers hold `can :manage, Course`,
  # which in CanCanCan is a wildcard that would grant any custom action on Course, this one included.
  def allow_authorized_course_staff_manage_ai_grading_settings
    can :manage, :ai_grading_settings
  end
end
