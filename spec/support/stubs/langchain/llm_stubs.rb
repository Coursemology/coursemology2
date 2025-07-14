# frozen_string_literal: true
module Langchain::LlmStubs
  class MockChatResponse
    attr_reader :completion

    def initialize(completion)
      @completion = completion
    end
  end

  class OpenAiStub < Langchain::LLM::Base
    def chat(messages: [], **_kwargs) # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
      system_message = messages.find { |msg| msg[:role] == 'system' }&.dig(:content) || ''
      user_message = messages.find { |msg| msg[:role] == 'user' }&.dig(:content) || ''

      # add more llm response use cases here as needed
      if rubric_grading_request?(system_message, user_message)
        handle_rubric_grading(system_message, user_message)
      elsif mrq_generation_request?(system_message, user_message)
        handle_mrq_generation(system_message, user_message)
      elsif output_fixing_request?(system_message, user_message)
        handle_output_fixing(system_message, user_message)
      else
        raise NotImplementedError, 'Unsupported request type'
      end
    end

    private

    def rubric_grading_request?(system_message, _user_message)
      system_message.include?('rubric') && system_message.include?('grade')
    end

    def mrq_generation_request?(system_message, _user_message)
      system_message.include?('multiple response questions') ||
        system_message.include?('multiple choice questions')
    end

    def output_fixing_request?(_system_message, user_message)
      user_message.include?('JSON Schema')
    end

    def handle_output_fixing(_system_message, user_message)
      schema = parse_json_schema(user_message)
      category_grades = {}
      category_properties = schema['properties']['category_grades']['properties']
      category_properties.each do |category_name, category_schema|
        category_grades[category_name] = {
          'criterion_id_with_grade' => category_schema['properties']['criterion_id_with_grade']['enum'].first,
          'explanation' => "Mock explanation for #{category_name}"
        }
      end
      mock_response = {
        'category_grades' => category_grades,
        'overall_feedback' => 'Mock overall feedback'
      }
      MockChatResponse.new(mock_response.to_json)
    end

    def handle_rubric_grading(system_message, _user_message)
      category_ids = system_message.scan(/Category ID: (\d+)/).flatten.map(&:to_i)
      criterion_ids_with_grades = extract_random_criterion(system_message)

      mock_response = { 'overall_feedback' => 'Mock overall feedback' }
      category_ids.zip(criterion_ids_with_grades).each do |category_id, criterion_id_with_grade|
        mock_response["category_#{category_id}"] = {
          'criterion_id_with_grade' => criterion_id_with_grade,
          'explanation' => "Mock explanation for category_#{category_id}"
        }
      end
      MockChatResponse.new(mock_response.to_json)
    end

    def handle_mrq_generation(_system_message, user_message)
      number_match = user_message.match(/generate (\d+) (multiple response|multiple choice)/)
      number_of_questions = number_match ? number_match[1].to_i : 1
      is_mcq = user_message.include?('multiple choice question')

      questions = []
      number_of_questions.times do |i|
        question_number = i + 1
        questions << (is_mcq ? build_mock_mcq(question_number) : build_mock_mrq(question_number))
      end
      mock_response = { 'questions' => questions }

      MockChatResponse.new(mock_response.to_json)
    end

    def build_mock_mcq(question_number)
      {
        'title' => "Mock generated MCQ Question #{question_number}",
        'description' => "Mock description for multiple choice question #{question_number}.",
        'options' => [
          { 'option' => "Option A for question #{question_number}", 'correct' => true,
            'explanation' => 'This is correct' },
          { 'option' => "Option B for question #{question_number}", 'correct' => false,
            'explanation' => 'This is incorrect' },
          { 'option' => "Option C for question #{question_number}", 'correct' => false,
            'explanation' => 'This is incorrect' },
          { 'option' => "Option D for question #{question_number}", 'correct' => false,
            'explanation' => 'This is incorrect' }
        ]
      }
    end

    def build_mock_mrq(question_number)
      {
        'title' => "Mock generated MRQ Question #{question_number}",
        'description' => "Mock description for multiple response question #{question_number}.",
        'options' => [
          { 'option' => "Option A for question #{question_number}", 'correct' => true,
            'explanation' => 'This is correct' },
          { 'option' => "Option B for question #{question_number}", 'correct' => true,
            'explanation' => 'This is also correct' },
          { 'option' => "Option C for question #{question_number}", 'correct' => false,
            'explanation' => 'This is incorrect' },
          { 'option' => "Option D for question #{question_number}", 'correct' => false,
            'explanation' => 'This is also incorrect' }
        ]
      }
    end

    def extract_random_criterion(system_message)
      category_sections = system_message.split(/(?=Category ID: \d+)/).reject(&:empty?)

      category_sections.filter_map do |section|
        criterion = section.scan(/- \[Grade: (\d+(?:\.\d+)?), Criterion ID: (\d+)\]/).sample
        if criterion
          {
            criterion_id: criterion[1].to_i,
            grade: criterion[0].to_i
          }
        end
      end
    end

    def parse_json_schema(user_message)
      json_match = user_message.match(/```json\s*(.*?)\s*```/m)
      JSON.parse(json_match[1])
    end
  end
  STUBBED_LANGCHAIN_OPENAI = OpenAiStub.new.freeze
end
