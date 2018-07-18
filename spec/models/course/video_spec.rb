# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video, type: :model do
  it { is_expected.to act_as(Course::LessonPlan::Item) }
  it { is_expected.to belong_to(:tab).inverse_of(:videos) }
  it { is_expected.to have_many(:submissions).inverse_of(:video).dependent(:destroy) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course, :with_video_component_enabled) }
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

      context 'when there are multiple tabs' do
        let(:tab) { create(:video_tab, course: course) }
        let!(:video5) do
          create(:video, course: course, start_at: Time.zone.now - 1.week, title: 'ABB', tab: tab)
        end
        let!(:video6) do
          create(:video, course: course, start_at: Time.zone.now + 1.week, title: 'CCC', tab: tab)
        end

        it 'does not consider videos in other tabs' do
          expect(video1.next_video).to eq(nil)
          expect(video2.next_video).to eq(video3)
          expect(video3.next_video).to eq(video4)
          expect(video4.next_video).to eq(video1)

          expect(video6.next_video).to eq(nil)
          expect(video5.next_video).to eq(video6)
        end
      end
    end

    describe 'validations' do
      let(:youtube_embedded_url) { "https://www.youtube.com/embed/#{youtube_video_id}" }
      let(:youtube_video_id) { 'dQw4w9WgXcQ' }

      context 'when video is new' do
        it 'allows url to be changed' do
          video = build(:video, course: course)
          video.url = youtube_embedded_url
          expect(video.valid?).to be_truthy
          expect(video.save).to be_truthy
        end
      end

      context 'when video exists ' do
        context 'when video does not have comments or sessions' do
          let!(:submission) { create(:video_submission, video: video2, creator: student1.user) }

          it 'allows url to be changed' do
            video1.url = youtube_embedded_url
            expect(video1.valid?).to be_truthy
            expect(video1.save).to be_truthy

            video2.url = youtube_embedded_url
            expect(video2.valid?).to be_truthy
            expect(video2.save).to be_truthy
          end
        end

        context 'when video have topics without posts' do
          let!(:topic) do
            create(:video_topic,
                   :with_submission,
                   course: course,
                   video: video1,
                   creator: student1.user,
                   posts: [])
          end

          it 'allows url to be changed' do
            video1.url = youtube_embedded_url
            expect(video1.valid?).to be_truthy
            expect(video1.save).to be_truthy
          end
        end

        context 'when video have topics with posts' do
          let(:video1) { create(:video, course: course) }
          let!(:topic1) do
            create(:video_topic,
                   :with_submission,
                   course: course,
                   video: video1,
                   creator: student1.user)
          end
          let!(:topic2) do
            create(:video_topic,
                   :with_submission,
                   course: course,
                   video: video1,
                   creator: student1.user,
                   posts: [])
          end

          it 'prevents the url from being changed' do
            video1.url = youtube_embedded_url
            expect(video1.valid?).to be_falsey
            expect(video1.save).to be_falsey
            expect { video1.save! }.to raise_exception(ActiveRecord::RecordInvalid)
          end
        end

        context 'when video has sessions' do
          let!(:session1) { create(:video_session, :with_events, video: video1) }
          let!(:session2) { create(:video_session, video: video2) }

          it 'prevents the url from being changed' do
            video1.url = youtube_embedded_url
            expect(video1.valid?).to be_falsey
            expect(video1.save).to be_falsey
            expect { video1.save! }.to raise_exception(ActiveRecord::RecordInvalid)

            video2.url = youtube_embedded_url
            expect(video2.valid?).to be_falsey
            expect(video2.save).to be_falsey
            expect { video2.save! }.to raise_exception(ActiveRecord::RecordInvalid)
          end
        end
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
            video = build(:video, course: course)
            video.url = url
            expect(video.save).to be_truthy
            expect(video.reload.url).to eq(youtube_embedded_url)
          end
        end

        context 'when url is invalid' do
          let(:invalid_urls) { ['https://google.com', 'http://youtube.com/fooooooo'] }

          it ' does not update and returns an error' do
            invalid_urls.each do |url|
              video = build(:video, course: course)
              video.url = url
              expect(video.save).to be_falsey
              expect { video.save! }.to raise_exception(ActiveRecord::RecordInvalid)
            end
          end
        end
      end
    end
  end
end
