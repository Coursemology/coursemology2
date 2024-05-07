# frozen_string_literal: true
# rubocop:disable Lint/EmptyBlock
FactoryBot.define do
  factory :course_assessment_question_voice_response,
          class: 'Course::Assessment::Question::VoiceResponse',
          parent: :course_assessment_question do
  end
end
# rubocop:enable Lint/EmptyBlock
