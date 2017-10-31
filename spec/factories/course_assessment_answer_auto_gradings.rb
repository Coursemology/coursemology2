# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_auto_grading, class: Course::Assessment::Answer::AutoGrading do
    answer { build(:course_assessment_answer) }
  end
end
