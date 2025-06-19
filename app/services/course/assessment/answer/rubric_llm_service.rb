# frozen_string_literal: true
class Course::Assessment::Answer::RubricLlmService
  @output_schema = JSON.parse(
    File.read('app/services/course/assessment/answer/prompts/rubric_auto_grading_output_format.json')
  )
  @output_parser = Langchain::OutputParsers::StructuredOutputParser.from_json_schema(
    @output_schema
  )
  @system_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/answer/prompts/rubric_auto_grading_system_prompt.json'
  )
  @user_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/answer/prompts/rubric_auto_grading_user_prompt.json'
  )
  @llm = LANGCHAIN_OPENAI

  class << self
    attr_reader :system_prompt, :user_prompt, :output_schema, :output_parser
    attr_accessor :llm
  end

  # Calls the LLM service to evaluate the answer.
  #
  # @param [Course::Assessment::Question::RubricBasedResponse] question The question to be graded.
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The student's answer.
  # @return [Hash] The LLM's evaluation response.
  def evaluate(question, answer)
    formatted_system_prompt = self.class.system_prompt.format
    formatted_user_prompt = self.class.user_prompt.format(
      question_title: question.title,
      question_description: question.description,
      rubric_categories: format_rubric_categories(question),
      answer_text: answer.answer_text,
      custom_prompt: question.ai_grading_custom_prompt
    )
    messages = [
      { role: 'system', content: formatted_system_prompt },
      { role: 'user', content: formatted_user_prompt }
    ]
    response = self.class.llm.chat(
      messages: messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'rubric_grading_output',
          strict: true,
          schema: self.class.output_schema
        }
      }
    ).completion
    parse_llm_response(response)
  end

  # Formats rubric categories for inclusion in the LLM prompt
  # @param [Course::Assessment::Question::TextResponse] question The question containing rubric categories
  # @return [String] Formatted string representation of rubric categories and criteria
  def format_rubric_categories(question)
    question.categories.without_bonus_category.includes(:criterions).map do |category|
      criterions = category.criterions.map do |criterion|
        "- [Grade: #{criterion.grade}, Criterion ID: #{criterion.id}]: #{criterion.explanation}"
      end
      <<~CATEGORY
        Category ID: #{category.id}
        Name: #{category.name}
        Criteria:
        #{criterions.join("\n")}
      CATEGORY
    end.join("\n\n")
  end

  # Parses LLM response with retry logic for handling parsing failures
  # @param [String] response The raw LLM response to parse
  # @return [Hash] The parsed response as a structured hash
  def parse_llm_response(response)
    fix_parser = Langchain::OutputParsers::OutputFixingParser.from_llm(
      llm: self.class.llm,
      parser: self.class.output_parser
    )
    fix_parser.parse(response)
  end
end
