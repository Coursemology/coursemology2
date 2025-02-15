# frozen_string_literal: true
json.history do
  answer_history = submission.answer_history
  history_viewable_map = @submission.questions.to_h { |question| [question.id, question.history_viewable?] }

  json.questions answer_history.map do |group|
    json.id group[:question_id]
    json.answers group[:answers]
    json.canViewHistory history_viewable_map[group[:question_id]]
  end
end
