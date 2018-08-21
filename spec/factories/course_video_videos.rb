# frozen_string_literal: true
FactoryBot.define do
  sequence(:course_video_title) { |n| "Video #{n}" }
  sequence(:course_video_description) { |n| "Video Description #{n}" }
  factory :course_video, class: Course::Video.name, aliases: [:video],
                         parent: :course_lesson_plan_item do
    course
    tab { course.default_video_tab }
    title { generate(:course_video_title) }
    description { generate(:course_video_description) }
    url { 'https://www.youtube.com/embed/i_YiovUyMds' }
    published { false }

    trait :not_started do
      start_at { 1.day.from_now }
    end

    trait :published do
      published { true }
    end
  end
end
