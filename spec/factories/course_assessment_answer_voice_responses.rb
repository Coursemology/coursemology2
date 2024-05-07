# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_voice_response,
          class: 'Course::Assessment::Answer::VoiceResponse',
          parent: :course_assessment_answer do
    transient do
      question_traits { nil }
    end

    question do
      build(:course_assessment_question_voice_response, *question_traits,
            assessment: assessment).question
    end
  end
end
