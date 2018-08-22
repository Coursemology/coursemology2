# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_programming,
          class: Course::Assessment::Answer::Programming,
          parent: :course_assessment_answer do
    transient do
      question_traits { nil }
      file_count { nil }
      file_contents { nil }
      creator { create(:user) }
    end

    question do
      traits = *question_traits
      options = traits.extract_options!
      options[:assessment] = assessment

      build(:course_assessment_question_programming, *traits, options).question
    end

    files do
      if file_count
        file_count.downto(1).map do
          build(:course_assessment_answer_programming_file, answer: nil)
        end
      elsif file_contents
        file_contents.map do |content|
          build(:course_assessment_answer_programming_file, answer: nil, content: content)
        end
      else
        []
      end
    end
  end
end
