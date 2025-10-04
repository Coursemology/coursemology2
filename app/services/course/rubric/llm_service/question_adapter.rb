# frozen_string_literal: true
class Course::Rubric::LlmService::QuestionAdapter
  def question_title
    raise NotImplementedError, 'Subclasses must implmement this'
  end

  def question_description
    raise NotImplementedError, 'Subclasses must implmement this'
  end
end
