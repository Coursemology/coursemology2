FactoryGirl.define do
  factory :course_assessment_answer_multiple_response,
          class: Course::Assessment::Answer::MultipleResponse,
          parent: :course_assessment_answer do
    question do
      build(:course_assessment_question_multiple_response, assessment: assessment).question
    end

    trait :wrong do
      after(:build) do |answer|
        question = answer.question.actable
        answer.options = question.options - question.options.select(&:correct)
      end
    end

    trait :correct do
      after(:build) do |answer|
        question = answer.question.actable
        answer.options = question.options.select(&:correct)
        answer.options = answer.options.sample(1) if question.any_correct?
      end
    end
  end
end
