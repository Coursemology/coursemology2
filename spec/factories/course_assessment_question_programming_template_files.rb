# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_programming_template_file,
          class: Course::Assessment::Question::ProgrammingTemplateFile do
    question { build(:course_assessment_question_programming) }
    sequence(:filename) { |n| "file_#{n}" }
    content ''
  end
end
