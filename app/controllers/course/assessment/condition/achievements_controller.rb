# frozen_string_literal: true
class Course::Assessment::Condition::AchievementsController <
  Course::Condition::AchievementsController
  include Course::AssessmentConditionalConcern
end
