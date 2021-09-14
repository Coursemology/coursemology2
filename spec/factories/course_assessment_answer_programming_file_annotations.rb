# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_programming_file_annotation,
          class: Course::Assessment::Answer::ProgrammingFileAnnotation,
          parent: :course_discussion_topic do
    transient do
      creator { nil }
    end
    file factory: :course_assessment_answer_programming_file
    line { 1 }

    after(:create) do |annotation, evaluator|
      annotation.file.answer.answer.submission.update_column(:creator_id, evaluator.creator.id) if evaluator.creator
    end
  end
end
