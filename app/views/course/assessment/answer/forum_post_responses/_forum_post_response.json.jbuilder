# frozen_string_literal: true
json.questionType answer.question.question_type

json.fields do
  json.questionId answer.question_id
  json.id answer.acting_as.id
  if answer.submission.workflow_state == 'attempting'
    json.answer_text answer.answer_text
  else
    json.answer_text format_ckeditor_rich_text(answer.answer_text)
  end
  json.partial! 'course/assessment/submission/answer/forum_post_response/posts/post_packs',
                selected_posts: answer.compute_post_packs
end

last_attempt = last_attempt(answer)

# Only rubric-graded forum questions carry a categoryGrades breakdown; default-graded answers are graded by
# the plain grade field, so emitting an (empty) breakdown would misroute their save through the rubric path.
if answer.question.grading_mode_rubric?
  json.partial! 'course/assessment/answer/rubric_category_grades', answer: answer, can_grade: can_grade
end

if answer.can_read_grade?(current_ability)
  json.explanation do
    json.correct last_attempt&.correct
    json.explanations []
  end
end
