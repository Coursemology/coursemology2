# frozen_string_literal: true
class Course::Achievement::Condition::AchievementsController <
  Course::Condition::AchievementsController
  include Course::AchievementConditionalConcern
end
