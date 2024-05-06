# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Submission::SubmissionsController do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:video) { create(:video, :published, course: course) }

    before { controller_sign_in(controller, user) }

    describe '#create' do
      subject do
        post :create, params: { course_id: course, video_id: video }, format: :json
      end

      context 'when create fails' do
        let(:immutable_submission) do
          create(:video_submission, video: video, creator: user).tap do |stub|
            allow(stub).to receive(:save).and_return(false)
            allow(stub).to receive(:existing_submission).and_return(nil)
          end
        end

        before do
          controller.instance_variable_set(:@submission, immutable_submission)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
      # let(:json_response) { JSON.parse(response.body) }

      context 'when submission by user exists' do
        let!(:old_submission) { create(:video_submission, video: video, creator: user) }

        it 'returns the correct JSON response' do
          subject
          is_expected.to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['submissionId']).to eq(old_submission.id)
        end
      end
    end

    describe '#edit' do
      subject do
        get :edit, params: { course_id: course, video_id: video, id: submission }
      end

      context "when student accesses another student's submission" do
        let(:student1) { create(:course_student, course: course) }
        let(:student2) { create(:course_student, course: course) }
        let(:submission) { create(:video_submission, video: video, creator: student2.user) }

        before { controller_sign_in(controller, student1.user) }

        it 'raises an error' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end
  end
end
