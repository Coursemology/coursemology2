# frozen_string_literal: true

# Evaluates all answers associated with the given question.
# Call this service after the package of the question is updated.
class Course::Assessment::Question::AnswersEvaluationService
  # @param [Course::Assessment::Question] question The programming question.
  def initialize(question)
    @question = question
  end

  def call
    if @question.is_saving_snapshots?
      # find_each queries objects in batches, the batching is based on the table primary key.
      # In Rails 8, it will be possible to override the batch ordering using :cursor.
      # For now, we have to manually query the latest_answer_ids first.
      latest_answer_ids = @question.answers.
        unscope(:order).
        select('DISTINCT ON (submission_id) id').
        without_attempting_state.
        order('submission_id ASC, created_at DESC, id ASC')

      Course::Assessment::Answer.where(id: latest_answer_ids).find_each do |a|
        a.auto_grade!(reduce_priority: true)
      end
    else
      @question.answers.without_attempting_state.find_each do |a|
        a.auto_grade!(reduce_priority: true)
      end
    end
  end
end
