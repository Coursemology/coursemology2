# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Plagiarism::AssessmentsController, type: :controller do
  let(:instance) { Instance.default }

  EXAMPLE_HTML = '<html><body>Plagiarism Report</body></html>'
  EXAMPLE_URL = 'https://ssid.comp.nus.edu.sg/shared-urls/token_id'
  EXAMPLE_UUID = '641eb301-ffbc-44ce-838e-bf5679f990e1'

  with_tenant(:instance) do
    let(:course) { create(:course, :with_plagiarism_component_enabled) }
    let(:user) { create(:course_manager, course: course).user }
    let(:student1) { create(:course_student, course: course).user }
    let(:student2) { create(:course_student, course: course).user }
    let(:teaching_assistant) { create(:course_teaching_assistant, course: course).user }
    let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
    let(:submission1) { create(:submission, :submitted, assessment: assessment, creator: student1) }
    let(:submission2) { create(:submission, :submitted, assessment: assessment, creator: student2) }

    before do
      controller_sign_in(controller, user)
    end

    describe 'GET #plagiarism_data' do
      let(:course_users_hash) { { student1.id => student1, student2.id => student2 } }
      let(:plagiarism_results) do
        [
          {
            base_submission: submission1,
            compared_submission: submission2,
            plagiarism_score: 90,
            submission_pair_id: EXAMPLE_UUID
          }
        ]
      end

      before do
        allow(controller).to receive(:preload_course_users_hash).and_return(course_users_hash)
      end

      context 'when plagiarism check is completed' do
        let!(:plagiarism_check) do
          create(:course_assessment_plagiarism_check, assessment: assessment, workflow_state: :completed)
        end
        let(:service) { instance_double(Course::Assessment::Submission::SsidPlagiarismService) }

        before do
          allow(Course::Assessment::Submission::SsidPlagiarismService).to receive(:new).
            with(course, assessment).and_return(service)
          allow(service).to receive(:fetch_plagiarism_result).and_return(plagiarism_results)
        end

        it 'returns plagiarism data with results' do
          get :plagiarism_data, as: :json, params: { course_id: course, id: assessment }

          expect(response).to have_http_status(:success)
          expect(controller.instance_variable_get(:@results)).to eq(plagiarism_results)
        end
      end

      context 'when plagiarism check is still running' do
        let!(:plagiarism_check) do
          create(:course_assessment_plagiarism_check, assessment: assessment, workflow_state: :running)
        end

        it 'returns empty results' do
          get :plagiarism_data, as: :json, params: { course_id: course, id: assessment }

          expect(response).to have_http_status(:success)
          expect(controller.instance_variable_get(:@results)).to eq([])
        end
      end

      context 'when plagiarism check failed' do
        let!(:plagiarism_check) do
          create(:course_assessment_plagiarism_check, assessment: assessment, workflow_state: :failed)
        end

        it 'returns empty results' do
          get :plagiarism_data, as: :json, params: { course_id: course, id: assessment }
          expect(response).to have_http_status(:success)
          expect(controller.instance_variable_get(:@results)).to eq([])
        end
      end
    end

    describe 'POST #plagiarism_check' do
      let!(:job) { create(:trackable_job) }

      before do
        allow(Course::Assessment::PlagiarismCheckJob).to receive(:perform_later).
          with(course, assessment).and_return(double(job: job, job_id: job.id))
      end

      context 'when plagiarism check does not exist' do
        it 'creates a new plagiarism check and starts job' do
          expect do
            post :plagiarism_check, as: :json, params: { course_id: course, id: assessment }
          end.to change(Course::Assessment::PlagiarismCheck, :count).by(1)
          expect(response).to have_http_status(:success)
          plagiarism_check = assessment.reload.plagiarism_check
          expect(plagiarism_check.workflow_state).to eq('starting')
          expect(plagiarism_check.job).to eq(job)
        end
      end

      context 'when plagiarism check already exists' do
        let!(:existing_check) { create(:course_assessment_plagiarism_check, assessment: assessment) }

        it 'uses existing plagiarism check and starts job' do
          expect do
            post :plagiarism_check, as: :json, params: { course_id: course, id: assessment }
          end.not_to change(Course::Assessment::PlagiarismCheck, :count)
          existing_check.reload
          expect(existing_check.workflow_state).to eq('starting')
          expect(existing_check.job).to eq(job)
        end
      end
    end

    describe 'POST #plagiarism_checks' do
      let!(:assessment_ids) { [assessment.id] }
      let!(:job) { create(:trackable_job) }

      before do
        allow(Course::Assessment::PlagiarismCheckJob).to receive(:perform_later).
          and_return(double(job: job, job_id: job.id))
      end

      it 'starts plagiarism checks for given assessments' do
        expect do
          post :plagiarism_checks, as: :json, params: { course_id: course, assessment_ids: assessment_ids }
        end.to change(Course::Assessment::PlagiarismCheck, :count).by(1)
        expect(response).to have_http_status(:accepted)
        expect(assessment.reload.plagiarism_check.workflow_state).to eq('starting')
      end
    end

    describe 'POST #download_submission_pair_result' do
      let(:service) { instance_double(Course::Assessment::Submission::SsidPlagiarismService) }

      before do
        allow(Course::Assessment::Submission::SsidPlagiarismService).to receive(:new).
          with(course, assessment).and_return(service)
        allow(service).to receive(:download_submission_pair_result).
          with(EXAMPLE_UUID).and_return(EXAMPLE_HTML)
      end

      it 'returns the HTML report for the submission pair' do
        post :download_submission_pair_result, as: :json, params: {
          course_id: course,
          id: assessment,
          submission_pair_id: EXAMPLE_UUID
        }
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['html']).to eq(EXAMPLE_HTML)
      end
    end

    describe 'POST #share_submission_pair_result' do
      let(:service) { instance_double(Course::Assessment::Submission::SsidPlagiarismService) }

      before do
        allow(Course::Assessment::Submission::SsidPlagiarismService).to receive(:new).
          with(course, assessment).and_return(service)
        allow(service).to receive(:share_submission_pair_result).
          with(EXAMPLE_UUID).and_return(EXAMPLE_URL)
      end

      it 'returns the shared URL for the submission pair' do
        post :share_submission_pair_result, as: :json, params: {
          course_id: course,
          id: assessment,
          submission_pair_id: EXAMPLE_UUID
        }
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['url']).to eq(EXAMPLE_URL)
      end
    end

    describe 'POST #share_assessment_result' do
      let(:service) { instance_double(Course::Assessment::Submission::SsidPlagiarismService) }

      before do
        allow(Course::Assessment::Submission::SsidPlagiarismService).to receive(:new).
          with(course, assessment).and_return(service)
        allow(service).to receive(:share_assessment_result).and_return(EXAMPLE_URL)
      end

      it 'returns the shared URL for the assessment' do
        post :share_assessment_result, as: :json, params: {
          course_id: course,
          id: assessment
        }
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['url']).to eq(EXAMPLE_URL)
      end
    end

    describe 'GET #linked_and_unlinked_assessments' do
      render_views
      let!(:linked_assessment_in_duplication_tree) do
        create(:assessment, :published_with_programming_question, course: course)
      end
      let!(:unlinked_assessment_in_duplication_tree) do
        create(:assessment, :published_with_programming_question, course: course)
      end
      let!(:unlinked_assessment_not_in_duplication_tree) do
        create(:assessment, :published_with_programming_question, course: course)
      end

      before do
        create(:duplication_traceable_assessment,
               source: assessment,
               assessment: unlinked_assessment_in_duplication_tree)
        create(:duplication_traceable_assessment,
               source: assessment,
               assessment: linked_assessment_in_duplication_tree)
        assessment.linked_assessments << linked_assessment_in_duplication_tree
      end

      it 'returns linked and unlinked assessments, filtering unlinked to only include those in duplication tree' do
        get :linked_and_unlinked_assessments, as: :json, params: { course_id: course, id: assessment }
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['linkedAssessments'].pluck('id')).to contain_exactly(
          assessment.id, linked_assessment_in_duplication_tree.id
        )
        expect(json_response['unlinkedAssessments'].pluck('id')).to contain_exactly(
          unlinked_assessment_in_duplication_tree.id
        )
      end
    end

    describe 'PATCH #update_assessment_links' do
      let!(:linked_assessment) { create(:assessment, :published_with_programming_question, course: course) }

      it 'updates linked assessments successfully' do
        expect do
          patch :update_assessment_links, as: :json, params: {
            course_id: course,
            id: assessment,
            linked_assessment_ids: [linked_assessment.id]
          }
        end.to change { assessment.reload.linked_assessments.count }.by(1)
        expect(response).to have_http_status(:success)
        expect(assessment.linked_assessments).to include(linked_assessment)
      end
    end

    describe 'authorization' do
      [:student1, :teaching_assistant].each do |user_symbol|
        context "when the user is a #{user_symbol}" do
          before { controller_sign_in(controller, send(user_symbol)) }

          it 'denies access' do
            expect { get :index, params: { course_id: course } }.to raise_error(CanCan::AccessDenied)
            expect do
              get :plagiarism_data, params: { course_id: course, id: assessment }
            end.to raise_error(CanCan::AccessDenied)
            expect do
              post :plagiarism_check, params: { course_id: course, id: assessment }
            end.to raise_error(CanCan::AccessDenied)
            expect do
              post :plagiarism_checks,
                   params: { course_id: course, assessment_ids: [assessment.id] }
            end.to raise_error(CanCan::AccessDenied)
            expect do
              post :download_submission_pair_result, params: {
                course_id: course,
                id: assessment,
                base_submission_id: submission1.id,
                compared_submission_id: submission2.id
              }
            end.to raise_error(CanCan::AccessDenied)
            expect do
              post :share_submission_pair_result, params: {
                course_id: course,
                id: assessment,
                submission_pair_id: EXAMPLE_UUID
              }
            end.to raise_error(CanCan::AccessDenied)
            expect do
              post :share_assessment_result, params: {
                course_id: course,
                id: assessment
              }
            end.to raise_error(CanCan::AccessDenied)
            expect do
              get :linked_and_unlinked_assessments, params: { course_id: course, id: assessment }
            end.to raise_error(CanCan::AccessDenied)
            expect do
              patch :update_assessment_links, params: {
                course_id: course,
                id: assessment,
                linked_assessment_ids: []
              }
            end.to raise_error(CanCan::AccessDenied)
          end
        end
      end
    end
  end
end
