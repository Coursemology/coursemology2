# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_answer_programming_auto_grading,
          class: Course::Assessment::Answer::ProgrammingAutoGrading,
          parent: :course_assessment_answer_auto_grading do
  end
end
