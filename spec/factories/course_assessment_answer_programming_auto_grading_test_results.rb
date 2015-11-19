FactoryGirl.define do
  factory :course_assessment_answer_programming_auto_grading_test_result,
          class: Course::Assessment::Answer::ProgrammingAutoGradingTestResult do
    auto_grading { build(:course_assessment_answer_programming_auto_grading) }
    passed true
  end
end
