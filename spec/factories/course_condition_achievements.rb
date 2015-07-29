FactoryGirl.define do
  factory :course_condition_achievement,
          class: Course::Condition::Achievement.name, aliases: [:achievement_condition] do
    course
    achievement
    association :conditional, factory: :course_achievement

    after(:stub) do |achievement_condition, evaluator|
      achievement_condition.achievement = build_stubbed(:course_achievement,
                                                        course: evaluator.course)
      achievement_condition.conditional = build_stubbed(:course_achievement,
                                                        course: evaluator.course)
    end

    trait :self_referential do
      after(:stub) do |achievement_condition, _|
        achievement_condition.achievement = achievement_condition.conditional
      end
    end

    trait :duplicate_child do
      after(:build) do |achievement_condition, evaluator|
        condition = build(:course_condition_achievement,
                          course: evaluator.course,
                          achievement: evaluator.achievement)
        achievement_condition.conditional.conditions << condition.condition
      end
      to_create { |instance| instance.save(validate: false) }
    end
  end
end
