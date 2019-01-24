# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Submission do
  it { is_expected.to act_as(Course::ExperiencePointsRecord) }
  it { is_expected.to belong_to(:video).inverse_of(:submissions) }

  let!(:instance) { create(:instance, :with_video_component_enabled) }
  with_tenant(:instance) do
    let(:course) { create(:course, :with_video_component_enabled) }
    let!(:student) { create(:course_student, course: course) }
    let!(:other_student) { create(:course_student, course: course) }
    let(:video) { create(:video, :published, course: course, duration: 70) }
    let(:submission1) do
      create(:video_submission, video: video, creator: student.user, course_user: student)
    end
    let(:submission2) do
      create(:video_submission, video: video, creator: other_student.user,
                                course_user: other_student)
    end

    describe 'validations' do
      context 'when the course user is different from the submission creator' do
        subject do
          build(:video_submission, video: video, course_user: other_student,
                                   creator: student.user)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors.messages[:experience_points_record]).
            to include(I18n.
              t('activerecord.errors.models.course/video/submission.'\
                'attributes.experience_points_record.inconsistent_user'))
        end
      end

      context 'when a submission for the user and video already exists' do
        before { submission1 }
        subject { build(:video_submission, video: video, creator: student.user) }

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors.messages[:base]).
            to include(I18n.
              t('activerecord.errors.models.course/video/submission.'\
                'submission_already_exists'))
        end
      end
    end

    describe '.by_user' do
      before do
        submission1
        submission2
      end

      it "only returns the selected user's submissions" do
        expect(video.submissions.by_user(student.user).empty?).to be(false)
        expect(video.submissions.by_user(student.user).
          all? { |submission| submission.course_user.user == student.user }).to be(true)
      end
    end

    describe '.watch_frequency' do
      let!(:session1) { create(:video_session, :with_events_paused, submission: submission1) }
      let!(:session2) { create(:video_session, :with_events_continuous, submission: submission1) }

      it 'computes the right watch frequency distribution' do
        intervals = [[0, 5], [30, 50], [19, 37], [0, 20], [39, 70], [10, 25]]
        distribution = Array.new(71, 0)
        intervals.each do |interval|
          (interval[0]..interval[1]).each do |video_time|
            distribution[video_time] += 1
          end
        end

        expect(submission1.watch_frequency).to eq(distribution)
      end
    end

    describe '.update_statistic' do
      let!(:session1) { create(:video_session, :with_events_unclosed, submission: submission1) }
      let!(:session2) { create(:video_session, :with_events_paused, submission: submission1) }

      it 'updates the statistic with correct watch_freq and percent_watched' do
        expect(submission1.statistic).to be_nil

        submission1.update_statistic

        expect(submission1.statistic.watch_freq.size).to eq(71)
        expect(submission1.statistic.percent_watched).to eq(88)
      end
    end

    describe 'callbacks from Course::Video::Submission::TodoConcern' do
      before { submission1 }
      subject do
        Course::LessonPlan::Todo.
          find_by(item_id: video.lesson_plan_item.id, user_id: student.user.id)
      end

      context 'when the submission is created' do
        it 'sets the todo to completed' do
          expect(subject.completed?).to be_truthy
        end
      end

      context 'when the submission is destroyed' do
        it 'sets the todo state to not started' do
          submission1.destroy
          expect(subject.not_started?).to be_truthy
        end
      end

      context 'when the video is destroyed' do
        it 'deletes the todo' do
          video.destroy
          expect(subject).to be_nil
        end
      end
    end
  end
end
