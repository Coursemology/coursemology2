# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Submission::SubmissionsController do
  let!(:instance) { create(:instance, :with_video_component_enabled) }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, :with_video_component_enabled, creator: user) }
    let(:video) { create(:video, :published, course: course) }

    before { sign_in(user) }

    describe '#create' do
      subject do
        post :create, params: { course_id: course, video_id: video }
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

        it { is_expected.to redirect_to(course_videos_path(course)) }
        it 'sets the proper flash message' do
          expect(flash[:danger]).
            to eq(I18n.t('course.video.submission.submissions.create.failure', error: ''))
        end
      end

      context 'when submission by user exists' do
        let!(:old_submission) { create(:video_submission, video: video, creator: user) }

        it { is_expected.to redirect_to(edit_course_video_submission_path(course, video, old_submission)) }
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

        before { sign_in(student1.user) }

        it { is_expected.to redirect_to(course_video_path(course, video)) }
      end
    end
  end
end
