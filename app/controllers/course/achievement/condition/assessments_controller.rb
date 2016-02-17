# frozen_string_literal: true
class Course::Achievement::Condition::AssessmentsController <
  Course::Condition::AssessmentsController
  include Course::AchievementConditionalConcern
end
