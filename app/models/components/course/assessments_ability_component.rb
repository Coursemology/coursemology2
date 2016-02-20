# frozen_string_literal: true
module Course::AssessmentsAbilityComponent
  include AbilityHost::Component
  extend ActiveSupport::Concern

  include Course::Assessment::AssessmentAbility
  include Course::Assessment::SkillAbility
end
