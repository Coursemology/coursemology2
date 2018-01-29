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

    describe '.ordered_by_date_and_title' do
      it 'orders the videos by date and title' do
        video1
        video2
        consecutive = course.videos.ordered_by_date_and_title.each_cons(2)
        expect(consecutive.to_a).not_to be_empty
        expect(consecutive.all? { |first, second| first.start_at <= second.start_at })
      end
    end

    describe '.unwatched_by' do
      let!(:video3) { create(:video, course: course) }
      let!(:submission1) { create(:video_submission, video: video1, creator: student1.user) }
      let!(:submission2) { create(:video_submission, video: video1, creator: student2.user) }
      let!(:submission3) { create(:video_submission, video: video3, creator: student2.user) }

      it 'returns only unwatched videos' do
        video1
        video2
        expect(course.videos.unwatched_by(student1.user)).to contain_exactly(video2, video3)
        expect(course.videos.unwatched_by(student2.user)).to contain_exactly(video2)
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

    describe '#next_video' do
      let!(:video3) do
        create(:video, course: course, start_at: Time.zone.now - 1.week, title: 'AAA')
      end
      let!(:video4) do
        create(:video, course: course, start_at: Time.zone.now - 1.week, title: 'BBB')
      end
      before do
        video1
        video2
      end

      it 'returns the next video if it exists' do
        expect(video1.next_video).to eq(nil)
        expect(video2.next_video).to eq(video3)
        expect(video3.next_video).to eq(video4)
        expect(video4.next_video).to eq(video1)
      end
    end

    describe 'callbacks' do
      context 'when updating video url' do
        let(:youtube_embedded_url) { "https://www.youtube.com/embed/#{youtube_video_id}" }
        let(:youtube_video_id) { 'dQw4w9WgXcQ' }
        let(:youtube_valid_urls) do
          [
            "youtu.be/#{youtube_video_id}",
            "http://youtu.be/#{youtube_video_id}",
            "https://youtu.be/#{youtube_video_id}",
            "youtube.com/watch?v=#{youtube_video_id}",
            "http://youtube.com/watch?v=#{youtube_video_id}",
            "https://youtube.com/watch?v=#{youtube_video_id}",
            "https://www.youtube.com/watch?v=#{youtube_video_id}",
            "https://www.youtube.com/embed/#{youtube_video_id}",
            "https://www.youtube.com/v/#{youtube_video_id}"
          ]
        end

        it 'updates to the youtube embed url' do
          youtube_valid_urls.each do |url|
            video1.reload.url = url
            expect(video1.save).to be_truthy
            expect(video1.reload.url).to eq(youtube_embedded_url)
          end
        end

        context 'when url is invalid' do
          let(:invalid_urls) { ['https://google.com', 'http://youtube.com/fooooooo'] }

          it ' does not update and returns an error' do
            invalid_urls.each do |url|
              video1.reload.url = url
              expect(video1.save).to be_falsey
              expect { video1.save! }.to raise_exception(ActiveRecord::RecordInvalid)
            end
          end
        end
      end
    end
  end
end
