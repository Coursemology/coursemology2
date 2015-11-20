FactoryGirl.define do
  factory :course_assessment_question_programming,
          class: Course::Assessment::Question::Programming,
          parent: :course_assessment_question do
    memory_limit 32
    time_limit 10
    language '' # TODO: Implement the Polyglot component
  end
end
