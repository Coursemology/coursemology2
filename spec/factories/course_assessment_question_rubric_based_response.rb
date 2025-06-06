# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_rubric_based_response,
          class: Course::Assessment::Question::RubricBasedResponse,
          parent: :course_assessment_question do
    transient do
      category_count { 2 }
      criterion_count { 2 }
    end

    after(:build) do |question, evaluator|
      evaluator.category_count.times do |i|
        category = build(:course_assessment_question_rubric_based_response_category,
                         question: question,
                         name: "Category #{i + 1}")
        evaluator.criterion_count.times do |j|
          criterion = build(:course_assessment_question_rubric_based_response_criterion,
                            category: category,
                            grade: (j + 1) * 2,
                            explanation: "Criterion explanation for grade #{(j + 1) * 2}")
          category.criterions << criterion
        end
        question.categories << category
      end
      # override the maximum grade in :course_assessment_question
      question.maximum_grade = evaluator.category_count * evaluator.criterion_count * 2
    end
  end
end
