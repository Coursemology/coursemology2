# frozen_string_literal: true
FactoryBot.define do
  factory :course_scholaistic_assessment,
          class: Course::ScholaisticAssessment.name,
          aliases: [:scholaistic_assessment],
          parent: :course_lesson_plan_item do
    course
    sequence(:title) { |n| "ScholAIstic Assessment #{n}" }
    upstream_id { SecureRandom.uuid }
    base_exp { 1000 }
    time_bonus_exp { 0 }
    bonus_end_at { nil }
    published { true }
  end
end
