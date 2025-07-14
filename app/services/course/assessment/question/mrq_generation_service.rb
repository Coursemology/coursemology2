# frozen_string_literal: true
class Course::Assessment::Question::MrqGenerationService
  @output_schema = JSON.parse(
    File.read('app/services/course/assessment/question/prompts/mcq_mrq_generation_output_format.json')
  )
  @output_parser = Langchain::OutputParsers::StructuredOutputParser.from_json_schema(
    @output_schema
  )
  @mrq_system_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/question/prompts/mrq_generation_system_prompt.json'
  )
  @mrq_user_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/question/prompts/mrq_generation_user_prompt.json'
  )
  @mcq_system_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/question/prompts/mcq_generation_system_prompt.json'
  )
  @mcq_user_prompt = Langchain::Prompt.load_from_path(
    file_path: 'app/services/course/assessment/question/prompts/mcq_generation_user_prompt.json'
  )
  @llm = LANGCHAIN_OPENAI

  class << self
    attr_reader :output_schema, :output_parser,
                :mrq_system_prompt, :mrq_user_prompt, :mcq_system_prompt, :mcq_user_prompt
    attr_accessor :llm
  end

  # Initializes the MRQ generation service with assessment and parameters.
  # @param [Course::Assessment] assessment The assessment to generate questions for.
  # @param [Hash] params Parameters for question generation.
  # @option params [String] :custom_prompt Custom instructions for the LLM.
  # @option params [Integer] :number_of_questions Number of questions to generate.
  # @option params [Hash] :source_question_data Data from an existing question to base new questions on.
  # @option params [String] :question_type Type of question to generate ('mrq' or 'mcq').
  def initialize(assessment, params)
    @assessment = assessment
    @params = params
    @custom_prompt = params[:custom_prompt].to_s
    @number_of_questions = (params[:number_of_questions] || 1).to_i
    @source_question_data = params[:source_question_data]
    @question_type = params[:question_type] || 'mrq'
  end

  # Calls the LLM service to generate MRQ or MCQ questions.
  # @return [Hash] The LLM's generation response containing multiple questions.
  def generate_questions
    messages = build_messages

    response = self.class.llm.chat(
      messages: messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'mcq_mrq_generation_output',
          strict: true,
          schema: self.class.output_schema
        }
      }
    ).completion
    parse_llm_response(response)
  end

  private

  # Builds the messages array from system and user prompt for the LLM chat
  # @return [Array<Hash>] Array of messages formatted for the LLM chat
  def build_messages
    system_prompt, user_prompt = select_prompts
    formatted_system_prompt = system_prompt.format
    formatted_user_prompt = user_prompt.format(
      custom_prompt: @custom_prompt,
      number_of_questions: @number_of_questions,
      source_question_title: @source_question_data&.dig(:title) || '',
      source_question_description: @source_question_data&.dig(:description) || '',
      source_question_options: format_source_options(@source_question_data&.dig(:options) || [])
    )

    [
      { role: 'system', content: formatted_system_prompt },
      { role: 'user', content: formatted_user_prompt }
    ]
  end

  # Selects the appropriate prompts based on the question type
  # @return [Array] Array containing system and user prompts
  def select_prompts
    if @question_type == 'mcq'
      [self.class.mcq_system_prompt, self.class.mcq_user_prompt]
    else
      [self.class.mrq_system_prompt, self.class.mrq_user_prompt]
    end
  end

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
