# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponsesController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:text_response) { nil }
    let(:user) { create(:course_manager, course: course).user }
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_text_response_question) do
      create(:course_assessment_question_text_response, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      next unless text_response

      controller.instance_variable_set(:@text_response_question, text_response)
    end

    describe '#create' do
      subject do
        question_text_response_attributes =
          attributes_for(:course_assessment_question_text_response).
          slice(:description, :maximum_grade, :max_attachments)
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_text_response: question_text_response_attributes
        }
      end

      context 'when saving fails' do
        let(:text_response) { immutable_text_response_question }
        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#edit' do
      let!(:text_response) do
        text_response = create(:course_assessment_question_text_response, assessment: assessment)
        text_response.question.update_column(:description, "<script>alert('boo');</script>")
        text_response.solutions.first.update_column(:explanation, "<script>alert('explain');</script>")
        text_response
      end

      subject do
        get :edit, as: :json, params: {
          course_id: course,
          assessment_id: assessment,
          id: text_response
        }
      end

      context 'when edit page is loaded' do
        it 'sanitizes the description text' do
          subject
          expect(assigns(:text_response_question).description).not_to include('script')
        end

        it 'sanitizes the explanation text' do
          subject
          expect(assigns(:text_response_question).solutions.first.explanation).not_to include('script')
        end
      end
    end

    describe '#update' do
      let(:text_response) { immutable_text_response_question }
      subject do
        question_text_response_attributes =
          attributes_for(:course_assessment_question_text_response).
          slice(:description, :maximum_grade)
        question_text_response_attributes[:question_assessment] = { skill_ids: [''] }
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: text_response,
          question_text_response: question_text_response_attributes
        }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@text_response_question, text_response)
        end

        it do
          is_expected.to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).not_to be_nil
        end
      end

      context 'with spreadsheet_formula solutions' do
        let(:text_response) { nil }

        let!(:question) do
          create(:course_assessment_question_text_response, assessment: assessment)
        end

        let!(:spreadsheet_solution) do
          create(:course_assessment_question_text_response_solution,
                 solution_type: :spreadsheet_formula,
                 solution: '=SUM(A1:A5)',
                 grade: 2,
                 explanation: '',
                 question: question)
        end

        def patch_question(spreadsheet_attrs)
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: question,
            question_text_response: {
              solutions_attributes: [{
                id: spreadsheet_solution.id,
                solution_type: 'spreadsheet_formula',
                solution: spreadsheet_solution.solution,
                grade: spreadsheet_solution.grade.to_s,
                explanation: '',
                test_spreadsheet_attributes: spreadsheet_attrs
              }]
            }
          }
        end

        context 'when adding a spreadsheet to a solution (null to non-null)' do
          it 'creates the spreadsheet record with the uploaded file and scalar fields' do
            patch_question(
              is_randomization_enabled: '0',
              is_random_seed_fixed: '1',
              test_random_seed: '42',
              is_timestamp_fixed: '0',
              test_timestamp: '',
              num_random_tests: '3',
              variables: '[]',
              file: fixture_file_upload('files/text.txt', 'text/plain')
            )

            expect(response).to have_http_status(:ok)
            spreadsheet_solution.reload
            expect(spreadsheet_solution.test_spreadsheet).not_to be_nil
            expect(spreadsheet_solution.test_spreadsheet.test_random_seed).to eq(42)
            expect(spreadsheet_solution.test_spreadsheet.num_random_tests).to eq(3)
          end
        end

        context 'when an existing spreadsheet is present' do
          before do
            spreadsheet = spreadsheet_solution.build_test_spreadsheet(
              is_randomization_enabled: false,
              is_random_seed_fixed: false,
              test_random_seed: 0,
              is_timestamp_fixed: false,
              test_timestamp: nil,
              num_random_tests: 2,
              variables: []
            )
            spreadsheet.attachment_reference = create(:attachment_reference)
            spreadsheet_solution.save!
          end

          it 'updates scalar fields including test_random_seed' do
            patch_question(
              id: spreadsheet_solution.test_spreadsheet.id,
              is_randomization_enabled: '0',
              is_random_seed_fixed: '1',
              test_random_seed: '99',
              is_timestamp_fixed: '0',
              test_timestamp: '',
              num_random_tests: '5',
              variables: '[]'
            )

            expect(response).to have_http_status(:ok)
            spreadsheet_solution.test_spreadsheet.reload
            expect(spreadsheet_solution.test_spreadsheet.is_random_seed_fixed).to be(true)
            expect(spreadsheet_solution.test_spreadsheet.test_random_seed).to eq(99)
            expect(spreadsheet_solution.test_spreadsheet.num_random_tests).to eq(5)
          end

          it 'updates test_timestamp from an ISO string' do
            timestamp_str = '2024-06-01T10:30:00.000Z'

            patch_question(
              id: spreadsheet_solution.test_spreadsheet.id,
              is_randomization_enabled: '0',
              is_random_seed_fixed: '0',
              test_random_seed: '0',
              is_timestamp_fixed: '1',
              test_timestamp: timestamp_str,
              num_random_tests: '2',
              variables: '[]'
            )

            expect(response).to have_http_status(:ok)
            spreadsheet_solution.test_spreadsheet.reload
            expect(spreadsheet_solution.test_spreadsheet.is_timestamp_fixed).to be(true)
            expect(spreadsheet_solution.test_spreadsheet.test_timestamp).
              to be_within(1.second).of(Time.zone.parse(timestamp_str))
          end

          it 'clears test_timestamp when an empty string is sent' do
            spreadsheet_solution.test_spreadsheet.
              update_column(:test_timestamp, Time.zone.now)

            patch_question(
              id: spreadsheet_solution.test_spreadsheet.id,
              is_randomization_enabled: '0',
              is_random_seed_fixed: '0',
              test_random_seed: '0',
              is_timestamp_fixed: '0',
              test_timestamp: '',
              num_random_tests: '2',
              variables: '[]'
            )

            expect(response).to have_http_status(:ok)
            expect(spreadsheet_solution.test_spreadsheet.reload.test_timestamp).to be_nil
          end

          it 'removes the spreadsheet when _destroy is set (non-null to null)' do
            spreadsheet_id = spreadsheet_solution.test_spreadsheet.id

            patch_question(
              id: spreadsheet_id,
              _destroy: '1'
            )

            expect(response).to have_http_status(:ok)
            expect(spreadsheet_solution.reload.test_spreadsheet).to be_nil
            expect(Course::Assessment::Question::TextResponseSolutionSpreadsheet.
              find_by(id: spreadsheet_id)).to be_nil
          end
        end
      end
    end

    describe '#destroy' do
      let(:text_response) { immutable_text_response_question }
      subject { post :destroy, params: { course_id: course, assessment_id: assessment, id: text_response } }

      context 'when destroy fails' do
        it 'responds bad response with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(text_response.errors.full_messages.to_sentence)
        end
      end
    end
  end
end
