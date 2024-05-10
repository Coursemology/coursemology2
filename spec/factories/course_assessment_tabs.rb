# frozen_string_literal: true
FactoryBot.define do
  sequence(:course_assessment_tab_weight) { |n| n }
  factory :course_assessment_tab, class: 'Course::Assessment::Tab' do
    transient do
      course { nil }
    end
    category do
      options = {}
      options[:course] = course if course
      build(:course_assessment_category, options)
    end
    sequence(:title) { |n| "Tab #{n}" }
    weight { generate(:course_assessment_tab_weight) }
  end
end
