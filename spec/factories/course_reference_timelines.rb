# frozen_string_literal: true
FactoryBot.define do
  factory :course_reference_timeline, class: 'Course::ReferenceTimeline' do
    course
    default { false }
    sequence(:title) { |n| "Timeline #{n}" }

    trait :default do
      default { true }
      title { nil }
    end
  end
end
