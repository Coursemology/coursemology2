# frozen_string_literal: true
FactoryBot.define do
  factory :course_gradebook_tab_contribution, class: Course::Gradebook::TabContribution.name do
    association :tab, factory: :course_assessment_tab
    course { tab.category.course }
    weight { 0 }
    weight_mode { :equal }
  end
end
