# frozen_string_literal: true
class Course::Assessment::Answer::RubricAutoGradingService < Course::Assessment::Answer::AutoGradingService # rubocop:disable Metrics/ClassLength
  def evaluate(answer)
    answer.correct, grade, messages, feedback = evaluate_answer(answer.actable)
    answer.auto_grading.result = { messages: messages }
    Course::Assessment::Answer::AiGeneratedPostService.new(answer, feedback).create_ai_generated_draft_post
    grade
  end

  private

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer specified.
  # @return [Array<(Boolean, Integer, Object, String)>] The correct status, grade, messages to be
  #   assigned to the grading, and feedback for the draft post.
  def evaluate_answer(answer)
    question_adapter = Course::Assessment::Question::QuestionAdapter.new(answer.question)
    rubric_adapter = Course::Assessment::Question::RubricBasedResponse::RubricAdapter.new(answer.question.actable)
    answer_adapter = Course::Assessment::Answer::RubricBasedResponse::AnswerAdapter.new(answer)

    llm_response = Course::Rubric::LlmService.new(question_adapter, rubric_adapter, answer_adapter).evaluate
    answer_adapter.save_llm_results(llm_response)

    # Currently no support for correctness in rubric-based questions
    [true, answer.grade, ['success'], llm_response['feedback']]
  end
end
