# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_programming_file,
          class: Course::Assessment::Answer::ProgrammingFile do
    answer { build(:course_assessment_answer_programming) }
    sequence(:filename) { |n| "file_#{n}" }
    content ''
  end
end
