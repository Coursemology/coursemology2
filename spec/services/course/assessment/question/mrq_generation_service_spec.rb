# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::MrqGenerationService do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course, creator: user) }
    let(:params) do
      {
        custom_prompt: 'Generate questions about basic mathematics',
        number_of_questions: 2,
        source_question_data: {
          title: 'Sample Question',
          description: 'Sample description',
          options: [
            { 'option' => 'Option 1', 'correct' => true },
            { 'option' => 'Option 2', 'correct' => false }
          ]
        }
      }
    end

    subject { described_class.new(assessment, params) }

    describe '#initialize' do
      it 'initializes with the correct assessment and parameters' do
        service = described_class.new(assessment, params)

        expect(service.instance_variable_get(:@assessment)).to eq(assessment)
        expect(service.instance_variable_get(:@custom_prompt)).to eq('Generate questions about basic mathematics')
        expect(service.instance_variable_get(:@number_of_questions)).to eq(2)
        expect(service.instance_variable_get(:@source_question_data)).to eq(params[:source_question_data])
        expect(service.instance_variable_get(:@question_type)).to eq('mrq')
      end

      it 'sets default values when parameters are missing' do
        minimal_params = { custom_prompt: 'Test prompt' }
        service = described_class.new(assessment, minimal_params)

        expect(service.instance_variable_get(:@custom_prompt)).to eq('Test prompt')
        expect(service.instance_variable_get(:@number_of_questions)).to eq(1)
        expect(service.instance_variable_get(:@source_question_data)).to be_nil
        expect(service.instance_variable_get(:@question_type)).to eq('mrq')
      end

      it 'handles question_type parameter correctly' do
        mcq_params = params.merge(question_type: 'mcq')
        service = described_class.new(assessment, mcq_params)

        expect(service.instance_variable_get(:@question_type)).to eq('mcq')
      end

      it 'converts number_of_questions to integer' do
        string_params = params.merge(number_of_questions: '3')
        service = described_class.new(assessment, string_params)

        expect(service.instance_variable_get(:@number_of_questions)).to eq(3)
      end

      it 'converts custom_prompt to string' do
        symbol_params = params.merge(custom_prompt: :test_symbol)
        service = described_class.new(assessment, symbol_params)

        expect(service.instance_variable_get(:@custom_prompt)).to eq('test_symbol')
      end
    end

    describe '#generate_questions' do
      before do
        described_class.llm = Langchain::LlmStubs::STUBBED_LANGCHAIN_OPENAI
      end

      it 'generates questions using the LLM service' do
        result = subject.generate_questions

        expect(result).to be_a(Hash)
        expect(result['questions']).to be_an(Array)
        expect(result['questions'].length).to eq(2)

        result['questions'].each do |question|
          expect(question).to have_key('title')
          expect(question).to have_key('description')
          expect(question).to have_key('options')
          expect(question['options']).to be_an(Array)
          expect(question['options'].length).to be >= 4

          question['options'].each do |option|
            expect(option).to have_key('option')
            expect(option).to have_key('correct')
            expect(option['correct']).to be_in([true, false])
          end
        end
      end

      it 'formats source question options correctly' do
        result = subject.generate_questions

        expect(result['questions']).to be_an(Array)
        expect(result['questions'].length).to eq(2)
      end

      context 'with empty source question data' do
        let(:params) do
          {
            custom_prompt: 'Generate questions about basic mathematics',
            number_of_questions: 1,
            source_question_data: {}
          }
        end

        it 'handles empty source data gracefully' do
          result = subject.generate_questions
          expect(result['questions']).to be_an(Array)
          expect(result['questions'].length).to eq(1)
        end
      end
    end

    describe '#format_source_options' do
      it 'formats options correctly' do
        options = [
          { 'option' => 'First option', 'correct' => true },
          { 'option' => 'Second option', 'correct' => false }
        ]

        formatted = subject.send(:format_source_options, options)
        expect(formatted).to include('Option 1: First option (Correct: true)')
        expect(formatted).to include('Option 2: Second option (Correct: false)')
      end

      it 'returns "None" for empty options' do
        formatted = subject.send(:format_source_options, [])
        expect(formatted).to eq('None')
      end
    end
  end
end
