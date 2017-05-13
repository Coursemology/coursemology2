# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_answer_scribing,
          class: Course::Assessment::Answer::Scribing,
          parent: :course_assessment_answer do
    transient do
      question_traits nil
    end

    question do
      build(:course_assessment_question_scribing, *question_traits,
            assessment: assessment).question
    end
  end
end
