# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_live_feedback, class: Course::Assessment::LiveFeedback do
    assessment
    question { association(:course_assessment_question_programming, assessment: assessment) }
    creator { association(:course_user, course: assessment.course) }
  end
end
