# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_scribing,
          class: Course::Assessment::Question::Scribing,
          parent: :course_assessment_question do
  end
end
