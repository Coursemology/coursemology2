# frozen_string_literal: true

# Regrades a question's answers after its package is updated.
#
# Only answers whose grading is shown outside a submission's past answers are regraded: in each submission, the
# newest answer that is not still being edited. That is the attempt the submission edit page shows (see
# Course::Assessment::Submission::SubmissionsHelper#last_attempt) and the "last attempt" in assessment statistics.
# The submission's current answers are included explicitly too, since the edit page shows those once the
# submission is no longer being attempted.
#
# Earlier attempts keep the grades they were given. Their results still point at the test cases they were graded
# against, which the update moved to a snapshot of the previous version rather than deleting.
class Course::Assessment::Question::AnswersEvaluationService
  # @param [Course::Assessment::Question] question The programming question.
  def initialize(question)
    @question = question
  end

  def call
    answers_to_regrade.find_each do |answer|
      answer.auto_grade!(reduce_priority: true)
    end
  end

  private

  def answers_to_regrade
    graded_answers = @question.answers.without_attempting_state.unscope(:order)
    newest_per_submission = graded_answers.select('DISTINCT ON (submission_id) id').
                            order(:submission_id, created_at: :desc, id: :desc)

    Course::Assessment::Answer.where(id: newest_per_submission).
      or(Course::Assessment::Answer.where(id: graded_answers.current_answers.select(:id)))
  end
end
