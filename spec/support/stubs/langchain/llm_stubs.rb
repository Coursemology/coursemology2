# frozen_string_literal: true
module Langchain::LlmStubs
  class MockChatResponse
    attr_reader :completion

    def initialize(completion)
      @completion = completion
    end
  end

  class OpenAiStub < Langchain::LLM::Base
    def chat(messages: [], **_kwargs)
      user_message = messages.find { |msg| msg[:role] == 'user' }&.dig(:content) || ''

      # add more llm response use cases here as needed
      if rubric_grading_request?(user_message)
        handle_rubric_grading(user_message)
      elsif output_fixing_request?(user_message)
        handle_output_fixing(user_message)
      else
        raise NotImplementedError, 'Unsupported request type'
      end
    end

    private

    def rubric_grading_request?(user_message)
      user_message.include?('Category ID:') && user_message.include?('Criterion ID:') && user_message.include?('Grade:')
    end

    def output_fixing_request?(user_message)
      user_message.include?('JSON Schema')
    end

    def handle_output_fixing(_user_message)
      # only fix rubric grading output for now
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

    def handle_rubric_grading(user_message)
      category_ids = user_message.scan(/Category ID: (\d+)/).flatten.map(&:to_i)
      criterion_ids = extract_random_criterion_ids(user_message)

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

    def extract_random_criterion_ids(user_message)
      category_sections = user_message.split(/(?=Category ID: \d+)/).reject(&:empty?)

      category_sections.filter_map do |section|
        criterion_ids = section.scan(/- \[Grade: \d+(?:\.\d+)?, Criterion ID: (\d+)\]/)

        next if criterion_ids.empty?

        criterion_ids.sample.first.to_i
      end
    end
  end

  STUBBED_LANGCHAIN_OPENAI = OpenAiStub.new.freeze
end
