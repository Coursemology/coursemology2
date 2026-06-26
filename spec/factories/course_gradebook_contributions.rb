# frozen_string_literal: true
FactoryBot.define do
  factory :course_gradebook_contribution, class: Course::Gradebook::Contribution do
    course
    tab { association(:course_assessment_tab, course: course) }
    weight { 0 }
    weight_mode { :equal }
    keep_highest { 0 }
  end
end
