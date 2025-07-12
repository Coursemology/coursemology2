# frozen_string_literal: true
class Course::Assessment::Question::MrqGenerationService
  @output_schema = JSON.parse(
    File.read('app/services/course/assessment/question/prompts/mrq_generation_output_format.json')
  )
  @output_parser = Langchain::OutputParsers::StructuredOutputParser.from_json_schema(
    @output_schema
  )
  @system_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/question/prompts/mrq_generation_system_prompt.json'
  )
  @user_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/question/prompts/mrq_generation_user_prompt.json'
  )
  @llm = LANGCHAIN_OPENAI

  class << self
    attr_reader :system_prompt, :user_prompt, :output_schema, :output_parser
    attr_accessor :llm
  end

  def initialize(assessment, params)
    @assessment = assessment
    @params = params
    @custom_prompt = params[:custom_prompt].to_s
    @number_of_questions = params[:number_of_questions].to_i || 1
    @source_question_data = params[:source_question_data]
  end

  # Calls the LLM service to generate MRQ questions.
  # @return [Hash] The LLM's generation response containing multiple questions.
  def generate_questions
    formatted_system_prompt = self.class.system_prompt.format
    formatted_user_prompt = self.class.user_prompt.format(
      custom_prompt: @custom_prompt,
      number_of_questions: @number_of_questions,
      source_question_title: @source_question_data&.dig(:title) || '',
      source_question_description: @source_question_data&.dig(:description) || '',
      source_question_options: format_source_options(@source_question_data&.dig(:options) || [])
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
          name: 'mrq_generation_output',
          strict: true,
          schema: self.class.output_schema
        }
      }
    ).completion

    parse_llm_response(response)
  end

  private

  # Formats source question options for inclusion in the LLM prompt
  # @param [Array] options The source question options
  # @return [String] Formatted string representation of options
  def format_source_options(options)
    return 'None' if options.empty?

    options.map.with_index do |option, index|
      "- Option #{index + 1}: #{option['option']} (Correct: #{option['correct']})"
    end.join("\n")
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
