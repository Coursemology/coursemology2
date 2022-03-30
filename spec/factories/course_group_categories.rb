# frozen_string_literal: true
FactoryBot.define do
  factory :course_group_category, class: Course::GroupCategory.name do
    course
    sequence(:name) { |n| "Group Category #{n}" }
  end
end
