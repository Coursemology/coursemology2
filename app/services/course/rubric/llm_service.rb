# frozen_string_literal: true
class Course::Rubric::LlmService
  MAX_RETRIES = 1
  @system_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/answer/prompts/rubric_auto_grading_system_prompt.json'
  )
  @user_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/answer/prompts/rubric_auto_grading_user_prompt.json'
  )
  @llm = LANGCHAIN_OPENAI

  class << self
    attr_reader :system_prompt, :user_prompt
    attr_accessor :llm
  end

  def initialize(question_adapter, rubric_adapter, answer_adapter)
    @question_adapter = question_adapter
    @rubric_adapter = rubric_adapter
    @answer_adapter = answer_adapter
  end

  # Calls the LLM service to evaluate the answer.
  #
  # @return [Hash] The LLM's evaluation response.
  def evaluate
    formatted_system_prompt = self.class.system_prompt.format(
      question_title: @question_adapter.question_title,
      question_description: @question_adapter.question_description,
      rubric_categories: @rubric_adapter.formatted_rubric_categories,
      custom_prompt: @rubric_adapter.grading_prompt,
      model_answer: @rubric_adapter.model_answer
    )
    formatted_user_prompt = self.class.user_prompt.format(
      answer_text: @answer_adapter.answer_text
    )
    messages = [
      { role: 'system', content: formatted_system_prompt },
      { role: 'assistant', content: 'Your next response will be graded as the answer as-is.' },
      { role: 'user', content: formatted_user_prompt }
    ]
    dynamic_schema = @rubric_adapter.generate_dynamic_schema
    output_parser = Langchain::OutputParsers::StructuredOutputParser.from_json_schema(dynamic_schema)
    llm_response = call_llm_with_retries(messages, dynamic_schema, output_parser)
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

  # Parses LLM response with OutputFixingParser for handling parsing failures
  # @param [String] response The raw LLM response to parse
  # @param [Langchain::OutputParsers::StructuredOutputParser] output_parser The parser to use
  # @return [Hash] The parsed response as a structured hash
  def parse_llm_response(response, output_parser)
    fix_parser = Langchain::OutputParsers::OutputFixingParser.from_llm(
      llm: self.class.llm,
      parser: output_parser
    )
    fix_parser.parse(response)
  end

  # Calls LLM with retry mechanism for parsing failures
  # @param [Array] messages The messages to send to LLM
  # @param [Hash] schema The JSON schema for response format
  # @param [Langchain::OutputParsers::StructuredOutputParser] output_parser The parser for LLM response
  # @return [Hash] The parsed LLM response
  def call_llm_with_retries(messages, schema, output_parser)
    retries = 0
    begin
      response = self.class.llm.chat(
        messages: messages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'rubric_grading_response',
            strict: true,
            schema: schema
          }
        }
      ).completion
      output_parser.parse(response)
    rescue Langchain::OutputParsers::OutputParserException
      if retries < MAX_RETRIES
        retries += 1
        retry
      else
        # If parsing fails after retries, use OutputFixingParser fallback
        parse_llm_response(response, output_parser)
      end
    end
  end
end
