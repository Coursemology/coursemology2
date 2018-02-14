# frozen_string_literal: true
FactoryBot.define do
  sequence(:course_video_tab_title) { |n| "Video Tab #{n}" }
  sequence(:course_video_tab_weight, &:itself)
  factory :course_video_tab, class: Course::Video::Tab.name,
                             aliases: [:video_tab] do
    course
    title { generate(:course_video_title) }
    weight { generate(:course_video_tab_weight) }
  end
end
