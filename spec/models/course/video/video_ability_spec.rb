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
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      # Course Video
      it { is_expected.to be_able_to(:manage, draft_video) }
      it { is_expected.to be_able_to(:manage, published_video) }
    end
  end
end
