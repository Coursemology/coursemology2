# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_scribing_scribble,
          class: Course::Assessment::Answer::ScribingScribble do
    answer { build(:course_assessment_answer_scribing) }
    creator { build(:user) }
    content { '' }
  end
end
