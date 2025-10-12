# frozen_string_literal: true
json.mockAnswerId answer_evaluation.mock_answer_id
json.rubricId answer_evaluation.rubric_id
json.selections answer_evaluation.selections do |selection|
  json.categoryId selection.category_id
  json.criterionId selection.criterion_id
  json.grade selection.criterion_id ? selection.criterion.grade : 0
end
json.feedback answer_evaluation.feedback
