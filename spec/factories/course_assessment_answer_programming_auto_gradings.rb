# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_programming_auto_grading,
          class: Course::Assessment::Answer::ProgrammingAutoGrading,
          parent: :course_assessment_answer_auto_grading do
    trait :with_null_byte do
      stderr { "Makefile:6: recipe for target 'test' failed\000" }
      stdout { "\000SyntaxError: invalid syntax" }
    end
  end
end
