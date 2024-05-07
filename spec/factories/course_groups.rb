# frozen_string_literal: true
FactoryBot.define do
  factory :course_group, class: 'Course::Group' do
    transient do
      course { build(:course) }
    end

    group_category { build(:course_group_category, course: course) }
    sequence(:name) { |n| "Group #{n}" }
  end
end
