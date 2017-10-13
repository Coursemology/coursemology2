# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Submission::SubmissionsController do
  let!(:instance) { create(:instance, :with_video_component_enabled) }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, :with_video_component_enabled, creator: user) }
    let(:video) { create(:video, :published, course: course) }
    let(:immutable_submission) do
      create(:video_submission, video: video, creator: user).tap do |stub|
        allow(stub).to receive(:save).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#create' do
      subject do
        post :create, params: { course_id: course, video_id: video }
      end

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@submission, immutable_submission)
          subject
        end

        it { is_expected.to redirect_to(course_videos_path(course)) }
        it 'sets the proper flash message' do
          expect(flash[:danger]).
            to eq(I18n.t('course.video.submission.submissions.create.failure', error: ''))
        end
      end
    end
  end
end
