# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_answer_programming_file_annotation,
          class: Course::Assessment::Answer::ProgrammingFileAnnotation do
    file factory: :course_assessment_answer_programming_file
    line 1
  end
end
