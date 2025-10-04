# frozen_string_literal: true
class Course::Assessment::Question::QuestionAdapter < Course::Rubric::LlmService::QuestionAdapter
  def initialize(question)
    super()
    @question = question
  end

  def question_title
    @question.title
  end

  def question_description
    @question.description
  end
end
