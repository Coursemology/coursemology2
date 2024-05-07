# frozen_string_literal: true
FactoryBot.define do
  sequence(:course_survey_question_option_text) { |n| "Option #{n}" }
  factory :course_survey_question_option, class: 'Course::Survey::QuestionOption' do
    transient do
      last_weight { question.options.maximum(:weight) }
    end

    association :question, factory: :survey_question
    option { generate(:course_survey_question_option_text) }
    weight { last_weight ? last_weight + 1 : 0 }

    trait :with_attachment do
      after(:build) do |question_option|
        attachment = create(:attachment_reference)
        question_option.attachment_reference = attachment
      end
    end
  end
end
