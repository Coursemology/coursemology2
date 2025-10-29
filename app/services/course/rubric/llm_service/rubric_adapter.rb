# frozen_string_literal: true
class Course::Rubric::LlmService::RubricAdapter
  # Formats rubric categories for inclusion in the LLM prompt
  # @return [String] Formatted string representation of rubric categories and criteria
  def formatted_rubric_categories
    raise NotImplementedError, 'Subclasses must implmement this'
  end

  def grading_prompt
    raise NotImplementedError, 'Subclasses must implmement this'
  end

  def model_answer
    raise NotImplementedError, 'Subclasses must implmement this'
  end

  # Generates dynamic JSON schema with separate fields for each category
  # @return [Hash] Dynamic JSON schema with category-specific fields
  def generate_dynamic_schema
    raise NotImplementedError, 'Subclasses must implmement this'
  end
end
