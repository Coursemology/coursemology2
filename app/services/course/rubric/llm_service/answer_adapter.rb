# frozen_string_literal: true
class Course::Rubric::LlmService::AnswerAdapter
  def answer_text
    raise NotImplementedError, 'Subclasses must implmement this'
  end

  def save_llm_results(_llm_response)
    raise NotImplementedError, 'Subclasses must implmement this'
  end
end
