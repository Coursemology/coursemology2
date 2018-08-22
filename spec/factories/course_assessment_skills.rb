# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_skill, class: Course::Assessment::Skill do
    course
    sequence(:title) { |n| "Skill #{n}" }
    description { 'Description' }
  end
end
