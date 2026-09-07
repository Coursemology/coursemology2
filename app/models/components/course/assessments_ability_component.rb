# frozen_string_literal: true
module Course::AssessmentsAbilityComponent
  include AbilityHost::Component
  extend ActiveSupport::Concern

  include Course::Assessment::AssessmentAbility
  include Course::Assessment::SkillAbility

  def define_permissions
    allow_instance_admins_manage_ai_grading_settings if instance_user&.administrator?

    super
  end

  private

  # Which model rubric grading runs on, the request options it is sent with, and any system prompt override
  # are operational levers over cost, latency and provider behaviour rather than course content, so they sit
  # above course managers: instance admins get them here, system admins already hold them through
  # `can :manage, :all` (see Ability#initialize).
  #
  # The subject is a symbol rather than Course on purpose -- course managers hold `can :manage, Course`,
  # which in CanCanCan is a wildcard that would grant any custom action on Course, this one included.
  def allow_instance_admins_manage_ai_grading_settings
    can :manage, :ai_grading_settings
  end
end
