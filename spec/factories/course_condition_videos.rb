# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_video,
          class: Course::Condition::Video.name, aliases: [:video_condition] do
    course
    video
    association :conditional, factory: :course_video
    minimum_watch_percentage { nil }
  end
end
