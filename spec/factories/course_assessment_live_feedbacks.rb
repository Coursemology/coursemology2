# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_live_feedback, class: Course::Assessment::LiveFeedback do
    assessment
    question { association(:course_assessment_question, assessment: assessment) }

    transient do
      with_comment { false }
    end

    after(:create) do |live_feedback, evaluator|
      create(:course_assessment_live_feedback_code, feedback: live_feedback, with_comment: evaluator.with_comment)
    end
  end
end
