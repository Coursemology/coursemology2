# frozen_string_literal: true
FactoryBot.define do
  factory :course_group, class: Course::Group.name do
    course
    sequence(:name) { |n| "Group #{n}" }

    trait :without_users do
      after(:build) do |group|
        group.group_users.clear
        # Override #should_create_manager? to let it return false
        group.define_singleton_method(:should_create_manager?) { false }
      end
    end
  end
end
