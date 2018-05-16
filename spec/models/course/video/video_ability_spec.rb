# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:course_user) { create(:course_student, course: course) }
    let(:draft_video) { create(:video, course: course) }
    let(:published_video) { create(:video, :published, course: course) }
    let(:published_video_not_started) { create(:video, :not_started, :published, course: course) }
    let(:video_submission) do
      create(:video_submission, video: published_video, creator: user)
    end
    let(:other_video_submission) do
      create(:video_submission, course: course, video: published_video)
    end
    let(:other_course) { create(:course) }
    let(:other_video) { create(:video, :published, course: other_course) }

    context 'when the user is a Course Student' do
      let(:user) { course_user.user }

      # Course Video
      it { is_expected.not_to be_able_to(:read, other_video) }
      it { is_expected.not_to be_able_to(:read, draft_video) }
      it { is_expected.to be_able_to(:read, published_video) }
      it { is_expected.to be_able_to(:read, published_video_not_started) }

      # Course Video Submissions
      it { is_expected.not_to be_able_to(:attempt, draft_video) }
      it { is_expected.not_to be_able_to(:attempt, published_video_not_started) }
      it { is_expected.to be_able_to(:attempt, published_video) }
      it { is_expected.not_to be_able_to(:create, other_video_submission) }
      it { is_expected.not_to be_able_to(:update, other_video_submission) }
      it { is_expected.to be_able_to(:create, video_submission) }
      it { is_expected.to be_able_to(:update, video_submission) }
    end

    context 'when the user is a Course Teaching Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      # Course Video
      it { is_expected.to be_able_to(:manage, draft_video) }
      it { is_expected.to be_able_to(:manage, published_video) }

      # Course Video Submissions
      it { is_expected.to be_able_to(:update, other_video_submission) }
      it { is_expected.to be_able_to(:read, other_video_submission) }
      it { is_expected.to be_able_to(:update, video_submission) }
      it { is_expected.to be_able_to(:read, video_submission) }
    end

    context 'when the user is a Course Observer' do
      let(:user) { create(:course_observer, course: course).user }

      # Course Video
      it { is_expected.to be_able_to(:read, draft_video) }
      it { is_expected.to be_able_to(:read, published_video) }
      it { is_expected.to be_able_to(:read, published_video_not_started) }
      it { is_expected.to be_able_to(:attempt, draft_video) }
      it { is_expected.to be_able_to(:attempt, published_video) }
      it { is_expected.to be_able_to(:attempt, published_video_not_started) }
      it { is_expected.not_to be_able_to(:manage, draft_video) }
      it { is_expected.not_to be_able_to(:manage, published_video) }
      it { is_expected.not_to be_able_to(:manage, published_video_not_started) }

      # Course Video Submissions
      it { is_expected.to be_able_to(:create, video_submission) }
      it { is_expected.to be_able_to(:read, video_submission) }
      it { is_expected.to be_able_to(:update, video_submission) }
      it { is_expected.not_to be_able_to(:create, other_video_submission) }
      it { is_expected.to be_able_to(:read, other_video_submission) }
      it { is_expected.not_to be_able_to(:update, other_video_submission) }
    end
  end
end
