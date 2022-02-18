# frozen_string_literal: true
FactoryBot.define do
  factory :course_tag, class: Course::Tag.name do
    course
    sequence(:title) { |n| "#{n} tag" }
    description { 'This is the test tag' }
  end
end
