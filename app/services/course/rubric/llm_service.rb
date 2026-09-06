# frozen_string_literal: true
# Builds the rubric grading prompt from the question/rubric/answer adapters and delegates the actual model
# call to a pluggable LLM adapter (see Course::Rubric::Llm). The prompt assembly and result post-processing
# here are provider-agnostic; anything model-specific lives behind the adapter.
class Course::Rubric::LlmService
  SCHEMA_NAME = 'rubric_grading_response'

  @system_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/answer/prompts/rubric_auto_grading_system_prompt.json'
  )
  @user_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/answer/prompts/rubric_auto_grading_user_prompt.json'
  )

  class << self
    attr_reader :system_prompt, :user_prompt

    # The placeholders a system prompt (built-in or overridden) is interpolated with, for the settings UI.
    # @return [Array<String>]
    def system_prompt_variables
      system_prompt.input_variables
    end
  end

  # @param llm_adapter [Course::Rubric::LlmService::LlmAdapter] the model to grade with (defaults to the
  #   course's current grading model).
  def initialize(question_adapter, rubric_adapter, answer_adapter, llm_adapter = Course::Rubric::Llm.build)
    @question_adapter = question_adapter
    @rubric_adapter = rubric_adapter
    @answer_adapter = answer_adapter
    @llm_adapter = llm_adapter
  end

  # Calls the LLM to evaluate the answer.
  #
  # @return [Hash] The LLM's evaluation response.
  def evaluate(context: '')
    llm_response = @llm_adapter.structured_completion(
      messages: build_messages(context),
      schema: @rubric_adapter.generate_dynamic_schema,
      schema_name: SCHEMA_NAME
    )
    llm_response['category_grades'] = process_category_grades(llm_response['category_grades'])
    llm_response
  end

  # Processes the category grades from the LLM response
  # @param [Hash] category_grades The category grades from the LLM response
  # @return [Array<Hash>] An array of hashes with category_id, criterion_id, grade, and explanation
  def process_category_grades(category_grades)
    category_grades.map do |field_name, category_grade|
      criterion_id, grade = category_grade['criterion_id_with_grade'].match(/criterion_(\d+)_grade_(\d+)/).captures
      {
        category_id: field_name.match(/category_(\d+)/).captures.first.to_i,
        criterion_id: criterion_id.to_i,
        grade: grade.to_i,
        explanation: category_grade['explanation']
      }
    end
  end

  private

  def build_messages(context)
    formatted_system_prompt = self.class.system_prompt.format(
      question_title: @question_adapter.question_title,
      question_description: @question_adapter.question_description,
      rubric_categories: @rubric_adapter.formatted_rubric_categories,
      custom_prompt: @rubric_adapter.grading_prompt,
      model_answer: @rubric_adapter.model_answer,
      context: context
    )
    formatted_user_prompt = self.class.user_prompt.format(
      answer_text: @answer_adapter.answer_text
    )
    [
      { role: 'system', content: formatted_system_prompt },
      { role: 'assistant', content: 'Your next response will be graded as the answer as-is.' },
      { role: 'user', content: formatted_user_prompt }
    ]
  end
end
