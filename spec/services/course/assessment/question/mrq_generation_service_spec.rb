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

    describe '#generate_questions' do
      before do
        allow(described_class).to receive(:llm).and_return(Langchain::LlmStubs::STUBBED_LANGCHAIN_OPENAI)
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