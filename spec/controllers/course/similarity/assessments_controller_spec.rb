# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Similarity::AssessmentsController, type: :controller do
  let(:instance) { Instance.default }

  EXAMPLE_HTML = '<html><body>Similarity Report</body></html>'
  EXAMPLE_URL = 'https://ssid.comp.nus.edu.sg/shared-urls/token_id'
  EXAMPLE_UUID = '641eb301-ffbc-44ce-838e-bf5679f990e1'

  with_tenant(:instance) do
    let(:course) { create(:course, :with_similarity_component_enabled) }
    let(:user) { create(:course_manager, course: course).user }
    let(:student1) { create(:course_student, course: course).user }
    let(:student2) { create(:course_student, course: course).user }
    let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
    let(:submission1) { create(:submission, :submitted, assessment: assessment, creator: student1) }
    let(:submission2) { create(:submission, :submitted, assessment: assessment, creator: student2) }

    before do
      controller_sign_in(controller, user)
    end

    describe 'GET #similarity_data' do
      let(:course_users_hash) { { student1.id => student1, student2.id => student2 } }
      let(:similarity_results) do
        [
          {
            base_submission: submission1,
            compared_submission: submission2,
            similarity_score: 90,
            submission_pair_id: EXAMPLE_UUID
          }
        ]
      end

      before do
        allow(controller).to receive(:preload_course_users_hash).and_return(course_users_hash)
      end

      context 'when similarity check is completed' do
        let!(:similarity_check) do
          create(:course_assessment_similarity_check, assessment: assessment, workflow_state: :completed)
        end
        let(:service) { instance_double(Course::Assessment::Submission::SsidSimilarityService) }

        before do
          allow(Course::Assessment::Submission::SsidSimilarityService).to receive(:new).
            with(course, assessment).and_return(service)
          allow(service).to receive(:fetch_similarity_result).and_return(similarity_results)
        end

        it 'returns similarity data with results' do
          get :similarity_data, as: :json, params: { course_id: course, assessment_id: assessment }

          expect(response).to have_http_status(:success)
          expect(controller.instance_variable_get(:@results)).to eq(similarity_results)
        end
      end

      context 'when similarity check is still running' do
        let!(:similarity_check) do
          create(:course_assessment_similarity_check, assessment: assessment, workflow_state: :running)
        end

        it 'returns empty results' do
          get :similarity_data, as: :json, params: { course_id: course, assessment_id: assessment }

          expect(response).to have_http_status(:success)
          expect(controller.instance_variable_get(:@results)).to eq([])
        end
      end

      context 'when similarity check failed' do
        let!(:similarity_check) do
          create(:course_assessment_similarity_check, assessment: assessment, workflow_state: :failed)
        end

        it 'returns empty results' do
          get :similarity_data, as: :json, params: { course_id: course, assessment_id: assessment }
          expect(response).to have_http_status(:success)
          expect(controller.instance_variable_get(:@results)).to eq([])
        end
      end
    end

    describe 'POST #similarity_check' do
      let!(:job) { create(:trackable_job) }

      before do
        allow(Course::Assessment::SimilarityCheckJob).to receive(:perform_later).
          with(course, assessment).and_return(double(job: job, job_id: job.id))
      end

      context 'when similarity check does not exist' do
        it 'creates a new similarity check and starts job' do
          expect do
            post :similarity_check, as: :json, params: { course_id: course, assessment_id: assessment }
          end.to change(Course::Assessment::SimilarityCheck, :count).by(1)
          expect(response).to have_http_status(:success)
          similarity_check = assessment.reload.similarity_check
          expect(similarity_check.workflow_state).to eq('running')
          expect(similarity_check.job).to eq(job)
        end
      end

      context 'when similarity check already exists' do
        let!(:existing_check) { create(:course_assessment_similarity_check, assessment: assessment) }

        it 'uses existing similarity check and starts job' do
          expect do
            post :similarity_check, as: :json, params: { course_id: course, assessment_id: assessment }
          end.not_to change(Course::Assessment::SimilarityCheck, :count)
          existing_check.reload
          expect(existing_check.workflow_state).to eq('running')
          expect(existing_check.job).to eq(job)
        end
      end
    end

    describe 'POST #similarity_checks' do
      let!(:assessment_ids) { [assessment.id] }
      let!(:job) { create(:trackable_job) }

      before do
        allow(Course::Assessment::SimilarityCheckJob).to receive(:perform_later).
          and_return(double(job: job, job_id: job.id))
      end

      it 'starts similarity checks for given assessments' do
        expect do
          post :similarity_checks, as: :json, params: { course_id: course, assessment_ids: assessment_ids }
        end.to change(Course::Assessment::SimilarityCheck, :count).by(1)
        expect(response).to have_http_status(:accepted)
        expect(assessment.reload.similarity_check.workflow_state).to eq('running')
      end
    end

    describe 'POST #download_submission_pair_result' do
      let(:service) { instance_double(Course::Assessment::Submission::SsidSimilarityService) }

      before do
        allow(Course::Assessment::Submission::SsidSimilarityService).to receive(:new).
          with(course, assessment).and_return(service)
        allow(service).to receive(:download_submission_pair_result).
          with(EXAMPLE_UUID).and_return(EXAMPLE_HTML)
      end

      it 'returns the HTML report for the submission pair' do
        post :download_submission_pair_result, as: :json, params: {
          course_id: course,
          assessment_id: assessment,
          submission_pair_id: EXAMPLE_UUID
        }
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['html']).to eq(EXAMPLE_HTML)
      end
    end

    describe 'POST #share_submission_pair_result' do
      let(:service) { instance_double(Course::Assessment::Submission::SsidSimilarityService) }

      before do
        allow(Course::Assessment::Submission::SsidSimilarityService).to receive(:new).
          with(course, assessment).and_return(service)
        allow(service).to receive(:share_submission_pair_result).
          with(EXAMPLE_UUID).and_return(EXAMPLE_URL)
      end

      it 'returns the shared URL for the submission pair' do
        post :share_submission_pair_result, as: :json, params: {
          course_id: course,
          assessment_id: assessment,
          submission_pair_id: EXAMPLE_UUID
        }
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['url']).to eq(EXAMPLE_URL)
      end
    end

    describe 'POST #share_assessment_result' do
      let(:service) { instance_double(Course::Assessment::Submission::SsidSimilarityService) }

      before do
        allow(Course::Assessment::Submission::SsidSimilarityService).to receive(:new).
          with(course, assessment).and_return(service)
        allow(service).to receive(:share_assessment_result).and_return(EXAMPLE_URL)
      end

      it 'returns the shared URL for the assessment' do
        post :share_assessment_result, as: :json, params: {
          course_id: course,
          assessment_id: assessment
        }
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['url']).to eq(EXAMPLE_URL)
      end
    end

    describe 'authorization' do
      context 'when the user is a student1' do
        before { controller_sign_in(controller, student1) }

        it 'denies access' do
          expect { get :index, params: { course_id: course } }.to raise_error(CanCan::AccessDenied)
          expect do
            get :similarity_data, params: { course_id: course, assessment_id: assessment }
          end.to raise_error(CanCan::AccessDenied)
          expect do
            post :similarity_check, params: { course_id: course, assessment_id: assessment }
          end.to raise_error(CanCan::AccessDenied)
          expect do
            post :similarity_checks,
                 params: { course_id: course, assessment_ids: [assessment.id] }
          end.to raise_error(CanCan::AccessDenied)
          expect do
            post :download_submission_pair_result, params: {
              course_id: course,
              assessment_id: assessment,
              base_submission_id: submission1.id,
              compared_submission_id: submission2.id
            }
          end.to raise_error(CanCan::AccessDenied)
          expect do
            post :share_submission_pair_result, params: {
              course_id: course,
              assessment_id: assessment,
              submission_pair_id: EXAMPLE_UUID
            }
          end.to raise_error(CanCan::AccessDenied)
          expect do
            post :share_assessment_result, params: {
              course_id: course,
              assessment_id: assessment
            }
          end.to raise_error(CanCan::AccessDenied)
        end
      end
    end
  end
end
