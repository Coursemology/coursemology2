# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video, type: :model do
  it { is_expected.to act_as(Course::LessonPlan::Item) }
  it { is_expected.to have_many(:submissions).inverse_of(:video).dependent(:destroy) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student1) { create(:course_student, course: course) }
    let(:student2) { create(:course_student, course: course) }
    let(:video1) { create(:video, course: course) }
    let(:video2) { create(:video, course: course, start_at: Time.zone.now - 1.month) }

    describe '.ordered_by_date' do
      it 'orders the videos by date' do
        video1
        video2
        consecutive = course.videos.each_cons(2)
        expect(consecutive.to_a).not_to be_empty
        expect(consecutive.all? { |first, second| first.start_at <= second.start_at })
      end
    end

    describe '.with_submissions_by' do
      let(:submission1) { create(:video_submission, video: video1, creator: student1.user) }
      let(:submission2) { create(:video_submission, video: video1, creator: student2.user) }
      let(:submission3) { create(:video_submission, video: video2, creator: student2.user) }

      it 'returns all videos' do
        video1
        expect(course.videos.with_submissions_by(student1.user)).to contain_exactly(video1)
      end

      it "preloads the specified user's submissions" do
        submission1
        submission2

        videos = course.videos.with_submissions_by(student1.user)
        expect(videos.all? { |v| v.submissions.loaded? }).to be(true)
        submissions = videos.flat_map(&:submissions)
        expect(submissions.all? { |submission| submission.creator == student1.user }).to be(true)
      end
    end
  end
end
