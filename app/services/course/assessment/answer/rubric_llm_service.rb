# frozen_string_literal: true
class Course::Assessment::Answer::RubricLlmService # rubocop:disable Metrics/ClassLength
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

  # Calls the LLM service to evaluate the answer.
  #
  # @param [Course::Assessment::Question::RubricBasedResponse] question The question to be graded.
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The student's answer.
  # @return [Hash] The LLM's evaluation response.
  def evaluate(question, answer)
    formatted_system_prompt = self.class.system_prompt.format(
      question_title: question.title,
      question_description: question.description,
      rubric_categories: format_rubric_categories(question),
      custom_prompt: question.ai_grading_custom_prompt
    )
    formatted_user_prompt = self.class.user_prompt.format(
      answer_text: answer.answer_text
    )
    messages = [
      { role: 'system', content: formatted_system_prompt },
      { role: 'user', content: formatted_user_prompt }
    ]
    dynamic_schema = generate_dynamic_schema(question)
    output_parser = Langchain::OutputParsers::StructuredOutputParser.from_json_schema(dynamic_schema)
    llm_response = call_llm_with_retries(messages, dynamic_schema, output_parser)
    llm_response['category_grades'] = process_category_grades(llm_response['category_grades'])
    llm_response
  end

  # Generates dynamic JSON schema with separate fields for each category
  # @param [Course::Assessment::Question::RubricBasedResponse] question The question to be graded.
  # @return [Hash] Dynamic JSON schema with category-specific fields
  def generate_dynamic_schema(question)
    dynamic_schema = JSON.parse(
      File.read('app/services/course/assessment/answer/prompts/rubric_auto_grading_output_format.json')
    )
    question.categories.without_bonus_category.includes(:criterions).each do |category|
      field_name = "category_#{category.id}"
      dynamic_schema['properties']['category_grades']['properties'][field_name] =
        build_category_schema(category, field_name)
      dynamic_schema['properties']['category_grades']['required'] << field_name
    end
    dynamic_schema
  end

  def build_category_schema(category, field_name)
    criterion_ids_with_grades = category.criterions.map { |c| "criterion_#{c.id}_grade_#{c.grade}" }
    {
      'type' => 'object',
      'properties' => {
        'criterion_id_with_grade' => {
          'type' => 'string',
          'enum' => criterion_ids_with_grades,
          'description' => "Selected criterion for #{field_name}"
        },
        'explanation' => {
          'type' => 'string',
          'description' => "Explanation for selected criterion in #{field_name}"
        }
      },
      'required' => ['criterion_id_with_grade', 'explanation'],
      'additionalProperties' => false,
      'description' => "Selected criterion and explanation for #{field_name} #{category.name}"
    }
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
