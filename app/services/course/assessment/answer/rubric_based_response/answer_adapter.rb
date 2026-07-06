# frozen_string_literal: true
# See Course::Assessment::Answer::RubricGrading::AnswerAdapter for the shared save pipeline. A rubric-based
# response is graded on its free-text answer directly.
class Course::Assessment::Answer::RubricBasedResponse::AnswerAdapter <
  Course::Assessment::Answer::RubricGrading::AnswerAdapter
  def answer_text
    @answer.answer_text
  end
end
