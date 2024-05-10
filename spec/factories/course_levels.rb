# frozen_string_literal: true
FactoryBot.define do
  factory :course_level, class: 'Course::Level' do
    course
    sequence(:experience_points_threshold) { |n| n * 100 }
  end
end
