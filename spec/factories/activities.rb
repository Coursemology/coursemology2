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
  end
end
