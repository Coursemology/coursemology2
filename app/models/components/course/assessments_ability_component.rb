module Course::AssessmentsAbilityComponent
  include AbilityHost::Component
  extend ActiveSupport::Concern

  include Course::Assessment::AssessmentAbility
end
