# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_video,
          class: Course::Condition::Video.name, aliases: [:video_condition] do
    course
    video
    conditional { association :course_video, course: course }
    minimum_watch_percentage { nil }
  end
end
