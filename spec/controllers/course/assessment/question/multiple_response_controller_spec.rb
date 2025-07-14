# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::MultipleResponsesController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:multiple_response) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_mrq) do
      create(:course_assessment_question_multiple_response, assessment: assessment).tap do |mrq|
        allow(mrq).to receive(:save).and_return(false)
        allow(mrq).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      controller.instance_variable_set(:@multiple_response_question, multiple_response) if multiple_response
    end

    describe '#create' do
      subject do
        question_multiple_response_attributes =
          attributes_for(:course_assessment_question_multiple_response).
          slice(:description, :maximum_grade)
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_multiple_response: question_multiple_response_attributes
        }
      end

      context 'when saving fails' do
        let(:multiple_response) { immutable_mrq }

        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#generate' do
      let(:valid_params) do
        {
          course_id: course,
          assessment_id: assessment,
          custom_prompt: 'Generate questions about mathematics',
          number_of_questions: 2,
          question_type: 'mrq',
          source_question_data: '{"title": "Sample", "description": "Sample desc", "options": []}'
        }
      end

      let(:mock_generation_service) { instance_double(Course::Assessment::Question::MrqGenerationService) }
      let(:mock_generated_questions) do
        {
          'questions' => [
            {
              'title' => 'Generated Question 1',
              'description' => 'Description for question 1',
              'options' => [
                { 'option' => 'Option A', 'correct' => true, 'explanation' => 'Correct answer' },
                { 'option' => 'Option B', 'correct' => false, 'explanation' => 'Wrong answer' }
              ]
            },
            {
              'title' => 'Generated Question 2',
              'description' => 'Description for question 2',
              'options' => [
                { 'option' => 'Option C', 'correct' => true, 'explanation' => 'Correct answer' },
                { 'option' => 'Option D', 'correct' => false, 'explanation' => 'Wrong answer' }
              ]
            }
          ]
        }
      end

      before do
        allow(Course::Assessment::Question::MrqGenerationService).to receive(:new).and_return(mock_generation_service)
        allow(mock_generation_service).to receive(:generate_questions).and_return(mock_generated_questions)
      end

      context 'with valid parameters' do
        it 'generates questions successfully' do
          post :generate, params: valid_params

          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be true
          expect(json_response['data']['title']).to eq('Generated Question 1')
          expect(json_response['data']['description']).to eq('Description for question 1')
          expect(json_response['data']['options']).to be_an(Array)
          expect(json_response['data']['allQuestions']).to be_an(Array)
          expect(json_response['data']['numberOfQuestions']).to eq(2)
        end

        it 'calls the generation service with correct parameters' do
          expected_params = {
            custom_prompt: 'Generate questions about mathematics',
            number_of_questions: 2,
            question_type: 'mrq',
            source_question_data: { 'title' => 'Sample', 'description' => 'Sample desc', 'options' => [] }
          }

          expect(Course::Assessment::Question::MrqGenerationService).to receive(:new).with(assessment, expected_params)
          expect(mock_generation_service).to receive(:generate_questions)

          post :generate, params: valid_params
        end
      end

      context 'with invalid parameters' do
        it 'returns error when custom_prompt is missing' do
          post :generate, params: valid_params.except(:custom_prompt)

          expect(response).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to eq('Invalid parameters')
        end

        it 'returns error when number_of_questions is less than 1' do
          post :generate, params: valid_params.merge(number_of_questions: 0)

          expect(response).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to eq('Invalid parameters')
        end

        it 'returns error when number_of_questions is greater than 10' do
          post :generate, params: valid_params.merge(number_of_questions: 11)

          expect(response).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to eq('Invalid parameters')
        end

        it 'returns error when question_type is invalid' do
          post :generate, params: valid_params.merge(question_type: 'invalid_type')

          expect(response).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to eq('Invalid parameters')
        end

        it 'accepts valid question types' do
          ['mrq', 'mcq'].each do |question_type|
            post :generate, params: valid_params.merge(question_type: question_type)
            expect(response).to have_http_status(:ok)
          end
        end
      end

      context 'when generation service returns empty questions' do
        before do
          allow(mock_generation_service).to receive(:generate_questions).and_return({ 'questions' => [] })
        end

        it 'returns error when no questions are generated' do
          post :generate, params: valid_params

          expect(response).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to eq('No questions were generated')
        end
      end

      context 'when generation service raises an error' do
        before do
          allow(mock_generation_service).to receive(:generate_questions).and_raise(StandardError, 'Service error')
        end

        it 'handles errors gracefully' do
          post :generate, params: valid_params

          expect(response).to have_http_status(:internal_server_error)
          json_response = JSON.parse(response.body)
          expect(json_response['success']).to be false
          expect(json_response['message']).to eq('An error occurred while generating questions')
        end
      end

      context 'with source_question_data' do
        it 'handles valid JSON source_question_data' do
          post :generate, params: valid_params

          expect(response).to have_http_status(:ok)
        end

        it 'handles invalid JSON source_question_data gracefully' do
          post :generate, params: valid_params.merge(source_question_data: 'invalid json')

          expect(response).to have_http_status(:ok) # Should still work with empty source data
        end

        it 'handles missing source_question_data' do
          post :generate, params: valid_params.except(:source_question_data)

          expect(response).to have_http_status(:ok)
        end
      end
    end

    describe '#validate_generation_params' do
      let(:controller_instance) { controller }

      context 'with valid parameters' do
        it 'returns true for valid parameters' do
          valid_params = {
            custom_prompt: 'Valid prompt',
            number_of_questions: 5,
            question_type: 'mrq'
          }

          result = controller_instance.send(:validate_generation_params, valid_params)
          expect(result).to be true
        end

        it 'accepts mcq question type' do
          valid_params = {
            custom_prompt: 'Valid prompt',
            number_of_questions: 3,
            question_type: 'mcq'
          }

          result = controller_instance.send(:validate_generation_params, valid_params)
          expect(result).to be true
        end

        it 'accepts minimum number of questions' do
          valid_params = {
            custom_prompt: 'Valid prompt',
            number_of_questions: 1,
            question_type: 'mrq'
          }

          result = controller_instance.send(:validate_generation_params, valid_params)
          expect(result).to be true
        end

        it 'accepts maximum number of questions' do
          valid_params = {
            custom_prompt: 'Valid prompt',
            number_of_questions: 10,
            question_type: 'mrq'
          }

          result = controller_instance.send(:validate_generation_params, valid_params)
          expect(result).to be true
        end
      end

      context 'with invalid parameters' do
        it 'returns false when custom_prompt is missing' do
          invalid_params = {
            number_of_questions: 5,
            question_type: 'mrq'
          }

          result = controller_instance.send(:validate_generation_params, invalid_params)
          expect(result).to be false
        end

        it 'returns false when custom_prompt is empty' do
          invalid_params = {
            custom_prompt: '',
            number_of_questions: 5,
            question_type: 'mrq'
          }

          result = controller_instance.send(:validate_generation_params, invalid_params)
          expect(result).to be false
        end

        it 'returns false when number_of_questions is less than 1' do
          invalid_params = {
            custom_prompt: 'Valid prompt',
            number_of_questions: 0,
            question_type: 'mrq'
          }

          result = controller_instance.send(:validate_generation_params, invalid_params)
          expect(result).to be false
        end

        it 'returns false when number_of_questions is greater than 10' do
          invalid_params = {
            custom_prompt: 'Valid prompt',
            number_of_questions: 11,
            question_type: 'mrq'
          }

          result = controller_instance.send(:validate_generation_params, invalid_params)
          expect(result).to be false
        end

        it 'returns false when question_type is invalid' do
          invalid_params = {
            custom_prompt: 'Valid prompt',
            number_of_questions: 5,
            question_type: 'invalid_type'
          }

          result = controller_instance.send(:validate_generation_params, invalid_params)
          expect(result).to be false
        end

        it 'returns false when question_type is missing' do
          invalid_params = {
            custom_prompt: 'Valid prompt',
            number_of_questions: 5
          }

          result = controller_instance.send(:validate_generation_params, invalid_params)
          expect(result).to be false
        end
      end
    end

    describe '#update' do
      let(:multiple_response) { immutable_mrq }
      subject do
        question_multiple_response_attributes =
          attributes_for(:course_assessment_question_multiple_response).
          slice(:description, :maximum_grade)
        question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: multiple_response,
          question_multiple_response: question_multiple_response_attributes
        }
      end

      context 'when changing existing MRQ to MCQ question type' do
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            attributes_for(:course_assessment_question_multiple_response).
            slice(:description, :maximum_grade)
          question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
          patch :update, as: :json, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes,
            multiple_choice: 'true'
          }
        end

        it do
          subject
          expect(multiple_response.grading_scheme).to eq('any_correct')
        end
      end

      context 'when changing existing MCQ to MRQ question type' do
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            attributes_for(:course_assessment_question_multiple_response).
            slice(:description, :maximum_grade)
          question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes,
            multiple_choice: 'false'
          }
        end

        it do
          expect(multiple_response.grading_scheme).to eq('all_correct')
        end
      end

      context 'when changing existing MRQ to MCQ question type in assessment page' do
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            attributes_for(:course_assessment_question_multiple_response).
            slice(:description, :maximum_grade)
          question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
          patch :update, as: :json, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes,
            multiple_choice: 'true'
          }
        end

        it do
          subject
          expect(multiple_response.reload.grading_scheme).to eq('any_correct')
        end
      end

      context 'when changing existing MCQ to MRQ question type in assessment show page' do
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            attributes_for(:course_assessment_question_multiple_response).
            slice(:description, :maximum_grade)
          question_multiple_response_attributes[:question_assessment] = { skill_ids: [''] }
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes,
            multiple_choice: 'false'
          }
        end

        it do
          expect(multiple_response.grading_scheme).to eq('all_correct')
        end
      end

      context 'when weight is updated' do
        # Mutable multiple response question
        let(:weight) { 5 }
        let!(:multiple_response) do
          create(:course_assessment_question_multiple_response, assessment: assessment)
        end
        subject do
          question_multiple_response_attributes =
            {
              'options_attributes' =>
                {
                  '0' =>
                    {
                      id: multiple_response.options.first.id,
                      weight: weight
                    },
                  '1' =>
                    {
                      id: multiple_response.options.second.id,
                      weight: multiple_response.options.second.weight
                    }
                },
              question_assessment: { skill_ids: [''] }
            }
          patch :update, as: :json, params: {
            course_id: course, assessment_id: assessment, id: multiple_response,
            question_multiple_response: question_multiple_response_attributes
          }
        end

        it 'updates a valid weight' do
          subject
          saved_weight = multiple_response.reload.options.unscope(:order).first.weight
          expect(saved_weight).to eq(weight)
        end
      end
    end

    describe '#destroy' do
      let(:multiple_response) { immutable_mrq }
      subject { post :destroy, params: { course_id: course, assessment_id: assessment, id: multiple_response } }

      context 'when destroy fails' do
        it 'responds bad response with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(immutable_mrq.errors.full_messages.to_sentence)
        end
      end
    end
  end
end
