# frozen_string_literal: true
FactoryBot.define do
  factory :course_scholaistic_submission,
          class: Course::ScholaisticSubmission.name,
          aliases: [:scholaistic_submission],
          parent: :course_experience_points_record do
    association :assessment, factory: :course_scholaistic_assessment
    upstream_id { SecureRandom.uuid }
    association :creator, factory: :user
  end
end
