# frozen_string_literal: true
require 'rails_helper'

# The marketplace preview sandbox needs the finalise response to carry the auto-grading job it just
# enqueued, so the preview page can poll it and show the marks without a manual refresh. The job is
# created by an `after_commit` hook that fires during the finalising `save` — i.e. before the
# controller renders — so it is available to the view; these examples pin that down, and pin down
# that the key leaks nowhere else.
#
# NOTE: deliberately a separate file from submissions_controller_spec.rb, which is being edited
# concurrently by the preview-sandbox-authorization work.
RSpec.describe Course::Assessment::Submission::SubmissionsController, type: :controller do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    with_active_job_queue_adapter(:test) do
      render_views

      let(:previewer) { create(:user) }
      let(:assessment) { create(:assessment, :published, :with_mcq_question, course: course) }
      let!(:course_user) { create(:course_manager, course: course, user: previewer) }
      let!(:submission) do
        create(:submission, :attempting, assessment: assessment, course: course, creator: previewer)
      end

      before { controller_sign_in(controller, previewer) }

      def finalise!
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: submission,
          submission: { finalise: true }, format: :json
        }
      end

      context 'when the course is a marketplace preview sandbox' do
        let(:course) { create(:course, preview: true) }

        it 'exposes the url of the auto-grading job this request enqueued' do
          finalise!

          expect(response).to have_http_status(:ok)

          job_url = response.parsed_body['submission']['autoGradingJobUrl']
          expect(job_url).to match(/\A\/jobs\/[0-9a-f-]{36}\z/)
          expect(TrackableJob::Job.find(job_url.split('/').last)).to be_present
        end

        it 'does not expose the key on a plain edit, which enqueues nothing' do
          get :edit, params: { course_id: course, assessment_id: assessment, id: submission, format: :json }

          expect(response).to have_http_status(:ok)
          expect(response.parsed_body['submission']).not_to have_key('autoGradingJobUrl')
        end
      end

      context 'when the course is an ordinary course' do
        let(:course) { create(:course) }

        it 'does not expose the key, even though a job was still enqueued' do
          finalise!

          expect(response).to have_http_status(:ok)
          expect(response.parsed_body['submission']).not_to have_key('autoGradingJobUrl')
        end
      end
    end
  end
end
