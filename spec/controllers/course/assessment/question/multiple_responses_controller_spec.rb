# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::MultipleResponsesController do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course, creator: user) }

    before { sign_in(user) }

    describe 'POST #generate' do
      let(:valid_params) do
        {
          course_id: course.id,
          assessment_id: assessment.id,
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

      before do
        allow(Course::Assessment::Question::MrqGenerationService).to receive(:new).and_return(
          double('service', generate_questions: {
            'questions' => [
              {
                'title' => 'Generated Question 1',
                'description' => 'Description 1',
                'options' => [
                  { 'option' => 'A', 'correct' => true, 'explanation' => 'Correct' },
                  { 'option' => 'B', 'correct' => false, 'explanation' => 'Incorrect' }
                ]
              },
              {
                'title' => 'Generated Question 2',
                'description' => 'Description 2',
                'options' => [
                  { 'option' => 'C', 'correct' => true, 'explanation' => 'Correct' },
                  { 'option' => 'D', 'correct' => false, 'explanation' => 'Incorrect' }
                ]
              }
            ]
          })
        )
      end

      it 'generates questions successfully' do
        post :generate, params: valid_params

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['success']).to be true
        expect(json_response['data']['title']).to eq('Generated Question 1')
        expect(json_response['data']['description']).to eq('Description 1')
        expect(json_response['data']['options']).to be_an(Array)
        expect(json_response['data']['allQuestions']).to be_an(Array)
        expect(json_response['data']['numberOfQuestions']).to eq(2)
      end

      context 'with invalid parameters' do
        it 'returns error for missing custom prompt' do
          post :generate, params: valid_params.merge(custom_prompt: '')

          expect(response).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to include('Custom prompt is required')
        end

        it 'returns error for invalid number of questions' do
          post :generate, params: valid_params.merge(number_of_questions: 5)

          expect(response).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to include('Number of questions must be between 1 and 3')
        end

        it 'returns error for zero questions' do
          post :generate, params: valid_params.merge(number_of_questions: 0)

          expect(response).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to include('Number of questions must be between 1 and 3')
        end
      end

      context 'when generation service fails' do
        before do
          allow_any_instance_of(Course::Assessment::Question::MrqGenerationService).to receive(:generate_questions)
            .and_raise(StandardError, 'Generation failed')
        end

        it 'returns error response' do
          post :generate, params: valid_params

          expect(response).to have_http_status(:internal_server_error)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to include('An error occurred while generating questions')
        end
      end

      context 'when no questions are generated' do
        before do
          allow_any_instance_of(Course::Assessment::Question::MrqGenerationService).to receive(:generate_questions)
            .and_return({ 'questions' => [] })
        end

        it 'returns error for empty questions' do
          post :generate, params: valid_params

          expect(response).to have_http_status(:internal_server_error)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to include('No questions were generated')
        end
      end
    end
  end
end 