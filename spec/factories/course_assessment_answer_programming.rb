# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_answer_programming,
          class: Course::Assessment::Answer::Programming,
          parent: :course_assessment_answer do
    transient do
      question_traits nil
      file_count 0
    end

    question do
      traits = *question_traits
      options = traits.extract_options!
      options[:assessment] = assessment

      build(:course_assessment_question_programming, *traits, options).question
    end

    files do
      file_count.downto(1).map do
        build(:course_assessment_answer_programming_file, answer: nil)
      end
    end
  end
end
