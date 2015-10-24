FactoryGirl.define do
  factory :course_assessment_question_multiple_response_option,
          class: Course::Assessment::Question::MultipleResponseOption do
    question { build(:course_assessment_question_multiple_response) }
    correct false
    option 'Option'

    trait :correct do
      correct true
      option 'Correct'
    end
    trait :wrong do
      correct false
      option 'Wrong'
    end
  end
end
