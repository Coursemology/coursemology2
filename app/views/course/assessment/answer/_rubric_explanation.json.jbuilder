# frozen_string_literal: true
# The step-by-step gate for a rubric-graded answer: the Continue and Finalise buttons read +correct+, as does the
# server's maxStep (see Course::Assessment::QuestionsConcern#correctly_answered_question_ids). Rubric grading has
# no notion of a wrong answer, so +correct+ means "submitted at least once" -- the student may move on as soon as
# they have submitted, however long grading takes or whether it succeeds. Null until then, which hides the panel.
#
# Unlike other answer types this is not gated on can_read_grade?: it carries no grade, only whether the student
# has submitted, which they already know.
submitted = last_attempt.present? && !last_attempt.attempting?
json.explanation do
  json.correct submitted ? true : nil
  json.explanations []
end
