# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_question_scribings,
          class: Course::Assessment::Question::Scribing,
          parent: :course_assessment_question do
    attempt_limit 3
  end
end
