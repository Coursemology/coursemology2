# frozen_string_literal: true
# Load the question-rubric join model now, at boot, rather than first inside a transaction (as factory_bot:lint's):
# its userstamp setup looks up the columns of its default table name, which does not exist, and the failed query
# aborts an open transaction.
Course::Assessment::Question::QuestionRubric.name

FactoryBot.define do
  factory :course_assessment_question_rubric_based_response,
          class: Course::Assessment::Question::RubricBasedResponse,
          parent: :course_assessment_question do
    transient do
      category_count { 2 }
      # Criteria graded 0, 2, 4 per category: the grades of the former v1 factory (2, 4) plus the grade 0 a v2
      # rubric requires, so the question's maximum grade (the rubric total) is unchanged at 8.
      criterion_count { 3 }
      ai_grading_enabled { true }
      # The course owning the question's rubric; defaults to the assessment's.
      rubric_course { assessment&.course }
    end

    # Back the question with a v2 active rubric (linked to it), as the create flow does. Each category's
    # criteria are graded 0, 2, 4, ... (see the course_rubric factory).
    after(:build) do |question, evaluator|
      rubric = build(:course_rubric, course: evaluator.rubric_course || create(:course),
                                     category_count: evaluator.category_count,
                                     criterion_count: evaluator.criterion_count)
      question.active_rubric = rubric
      question.acting_as.question_rubrics.build(rubric: rubric)
      # override the maximum grade in :course_assessment_question with the rubric total
      question.maximum_grade = evaluator.category_count * (evaluator.criterion_count - 1) * 2
    end
  end
end
