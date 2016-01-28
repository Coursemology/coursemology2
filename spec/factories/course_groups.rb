# frozen_string_literal: true
FactoryGirl.define do
  factory :course_group, class: Course::Group.name do
    course
    sequence(:name)  { |n| "Group #{n}" }
  end
end
