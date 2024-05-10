# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_scribing,
          class: 'Course::Assessment::Answer::Scribing',
          parent: :course_assessment_answer do
    transient do
      question_traits { nil }
      contents { nil }
    end

    question do
      build(:course_assessment_question_scribing, *question_traits,
            assessment: assessment).question
    end

    scribbles do
      if contents
        contents.map do |content|
          build(:course_assessment_answer_scribing_scribble, answer: nil, content: content)
        end
      else
        []
      end
    end
  end
end
