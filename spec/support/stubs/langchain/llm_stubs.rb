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

    def output_fixing_request?(_system_message, user_message)
      user_message.include?('JSON Schema')
    end

    def handle_output_fixing(_system_message, _user_message)
      mock_response = {
        'category_grades' => [
          {
            'category_id' => 1,
            'criterion_id' => 1,
            'explanation' => 'Mock explanation for category 1'
          }
        ],
        'overall_feedback' => 'Mock overall feedback'
      }

      MockChatResponse.new(mock_response.to_json)
    end

    def handle_rubric_grading(system_message, _user_message)
      category_ids = system_message.scan(/Category ID: (\d+)/).flatten.map(&:to_i)
      criterion_ids = extract_random_criterion_ids(system_message)

      category_grades = category_ids.zip(criterion_ids).map do |category_id, criterion_id|
        {
          'category_id' => category_id,
          'criterion_id' => criterion_id,
          'explanation' => "Mock explanation for category #{category_id}"
        }
      end

      mock_response = {
        'category_grades' => category_grades,
        'overall_feedback' => 'Mock overall feedback'
      }

      MockChatResponse.new(mock_response.to_json)
    end

    def extract_random_criterion_ids(system_message)
      category_sections = system_message.split(/(?=Category ID: \d+)/).reject(&:empty?)

      category_sections.filter_map do |section|
        criterion_ids = section.scan(/- \[Grade: \d+(?:\.\d+)?, Criterion ID: (\d+)\]/)

        next if criterion_ids.empty?

        criterion_ids.sample.first.to_i
      end
    end
  end

  STUBBED_LANGCHAIN_OPENAI = OpenAiStub.new.freeze
end
