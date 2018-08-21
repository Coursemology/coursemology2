# frozen_string_literal: true
FactoryBot.define do
  factory :forum, class: Course::Forum.name do
    course
    sequence(:name) { |n| "forum #{n}" }
    description { 'This is the test forum' }
  end
end
