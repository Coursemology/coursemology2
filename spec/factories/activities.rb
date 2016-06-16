# frozen_string_literal: true
FactoryGirl.define do
  factory :activity do
    actor
    object { create(:user) }
    event 'test'
    notifier_type 'test_notifier'

    trait :achievement_gained do
      object { create(:course_achievement) }
      event :gained
      notifier_type Course::AchievementNotifier.name
    end

    trait :assessment_attempted do
      object { create(:assessment) }
      event :attempted
      notifier_type Course::AssessmentNotifier.name
    end

    trait :level_reached do
      object { create(:course_level) }
      event :reached
      notifier_type Course::LevelNotifier.name
    end
  end
end
