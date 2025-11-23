# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Video, type: :model do
  it { is_expected.to act_as(Course::Condition) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      subject do
        video = create(:video, course: course)
        build(:video_condition, course: course, video: video, conditional: video)
      end

      it 'validates minimum_watch_percentage' do
        expect(subject).to validate_numericality_of(:minimum_watch_percentage).allow_nil.
          is_greater_than_or_equal_to(0).is_less_than_or_equal_to(100)
      end

      context 'when a video is its own condition' do
        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:video]).to include(I18n.t('activerecord.errors.models.' \
                                                           'course/condition/video.attributes.video.references_self'))
        end
      end

      context "when a video is already included in its conditional's conditions" do
        subject do
          existing_video_condition = create(:video_condition, course: course)
          build(:video_condition, course: course, conditional: existing_video_condition.conditional,
                                  video: existing_video_condition.video)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:video]).to include(I18n.t('activerecord.errors.models.' \
                                                           'course/condition/video.attributes.video.unique_dependency'))
        end
      end

      context 'when a video is required by another conditional with the same id' do
        subject do
          id = Time.now.to_i
          video = create(:video, course: course, id: id)
          achievement = create(:achievement, course: course, id: id)
          required_video = create(:video, course: course)
          create(:video_condition, course: course, video: required_video, conditional: achievement)
          build_stubbed(:video_condition, course: course, video: required_video, conditional: video)
        end

        it { is_expected.to be_valid }
      end

      context 'when a video has the conditional as its own condition' do
        subject do
          video1 = create(:video, course: course)
          video2 = create(:video, course: course)
          create(:video_condition, course: course, video: video1, conditional: video2)
          build(:video_condition, course: course, video: video2, conditional: video1)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:video]).to include(I18n.t('activerecord.errors.models.' \
                                                           'course/condition/video.attributes.video.cyclic_dependency'))
        end
      end
    end

    describe 'callbacks' do
      describe '#video' do
        let(:course) { create(:course) }
        let(:student_user) { create(:course_student, course: course).user }
        let(:video) { create(:video, course: course) }
        let(:submission) { create(:video_submission, video: video, creator: student_user) }

        context 'when a submission is saved' do
          it 'evaluate_conditional_for the affected course_user' do
            expect(Course::Condition::Video).
              to receive(:evaluate_conditional_for).with(submission.course_user)
            submission.save!
          end
        end
      end
    end

    describe '#title' do
      let(:video) { create(:video, title: 'Video', course: course) }
      subject { create(:course_condition_video, video: video) }

      context 'when there is no minimum watch percentage' do
        it 'returns the statement to watch the video with the video title' do
          expect(subject.title).
            to eq(Course::Condition::Video.
                  human_attribute_name('title.complete', video_title: video.title))
        end
      end

      context 'when there is a minimum watch percentage' do
        it 'returns the video title with the minimum watch percentage' do
          subject.minimum_watch_percentage = 50.0

          expect(subject.title).
            to eq(Course::Condition::Video.
              human_attribute_name('title.minimum_watch_percentage',
                                   video_title: video.title,
                                   minimum_watch_percentage: '50.00%'))
        end
      end
    end

    describe '#satisfied_by?' do
      let(:course) { create(:course) }
      let(:course_user) { create(:course_student, course: course) }

      context 'when the video is not published' do
        let(:video) { create(:video, course: course) }
        subject { create(:course_condition_video, video: video) }

        it 'returns false' do
          expect(subject.satisfied_by?(course_user)).to be_falsey
        end
      end

      context 'when the video is published' do
        let(:video) { create(:video, :published, course: course, duration: 70) }

        context 'when there is no minimum watch percentage' do
          subject { create(:course_condition_video, video: video) }

          context 'when there is no submission' do
            it 'returns false' do
              expect(subject.satisfied_by?(course_user)).to be_falsey
            end
          end

          context 'there is a submission' do
            it 'returns true' do
              create(:video_submission, video: video, creator: course_user.user)
              expect(subject.satisfied_by?(course_user)).to be_truthy
            end
          end
        end

        context 'when there is a minimum watch percentage' do
          context 'when there is no submission' do
            subject { create(:course_condition_video, video: video, minimum_watch_percentage: 50) }

            it 'returns false' do
              expect(subject.satisfied_by?(course_user)).to be_falsey
            end
          end

          context 'there is a submission above the minimum watch percentage' do
            subject { create(:course_condition_video, video: video, minimum_watch_percentage: 50) }
            let(:submission) { create(:video_submission, video: video, creator: course_user.user) }
            let!(:session1) { create(:video_session, :with_events_unclosed, submission: submission) }
            let!(:session2) { create(:video_session, :with_events_paused, submission: submission) }

            it 'returns true' do
              # Sets percent_watched to 88
              submission.update_statistic
              expect(subject.satisfied_by?(course_user)).to be_truthy
            end
          end

          context 'there is a submission below the minimum watch percentage' do
            subject { create(:course_condition_video, video: video, minimum_watch_percentage: 90) }
            let(:submission) { create(:video_submission, video: video, creator: course_user.user) }
            let!(:session1) { create(:video_session, :with_events_unclosed, submission: submission) }
            let!(:session2) { create(:video_session, :with_events_paused, submission: submission) }

            it 'returns false' do
              # Sets percent_watched to 88
              submission.update_statistic
              expect(subject.satisfied_by?(course_user)).to be_falsey
            end
          end
        end
      end
    end

    describe '#compute_satisfaction_information' do
      let(:video) { create(:video, :published, course: course, duration: 70) }
      let(:course_user1) { create(:course_user, course: course) }
      let(:course_user2) { create(:course_user, course: course) }
      let(:course_user3) { create(:course_user, course: course) }

      context 'without minimum grade percentage' do
        subject { create(:course_condition_video, video: video) }

        context 'when all users have watched the video' do
          before do
            create(:video_submission, video: video, creator: course_user1.user)
            create(:video_submission, video: video, creator: course_user2.user)
            create(:video_submission, video: video, creator: course_user3.user)
          end

          it 'returns true for all users' do
            expect(subject.compute_satisfaction_information([course_user1, course_user2,
                                                             course_user3])).to eq([true, true, true])
          end
        end

        context 'when one user has not watched the video and the rest have' do
          before do
            create(:video_submission, video: video, creator: course_user1.user)
            create(:video_submission, video: video, creator: course_user3.user)
          end

          it 'returns false for that user and true for the rest' do
            expect(subject.compute_satisfaction_information([course_user1, course_user2,
                                                             course_user3])).to eq([true, false, true])
          end
        end

        context 'when all users have not watched the video' do
          it 'returns false for all users' do
            expect(subject.compute_satisfaction_information([course_user1, course_user2,
                                                             course_user3])).to eq([false, false, false])
          end
        end
      end

      context 'with minimum watch percentage' do
        let(:submission1) { create(:video_submission, video: video, creator: course_user1.user) }
        let(:submission2) { create(:video_submission, video: video, creator: course_user2.user) }
        let(:submission3) { create(:video_submission, video: video, creator: course_user3.user) }

        context 'when all users have met the minimum watch percentage' do
          subject { create(:course_condition_video, video: video, minimum_watch_percentage: 50) }

          before do
            create(:video_session, :with_events_unclosed, submission: submission1)
            create(:video_session, :with_events_paused, submission: submission1)
            create(:video_session, :with_events_unclosed, submission: submission2)
            create(:video_session, :with_events_paused, submission: submission2)
            create(:video_session, :with_events_unclosed, submission: submission3)
            create(:video_session, :with_events_paused, submission: submission3)
          end

          it 'returns true for all users' do
            # Sets percent_watched to 88
            submission1.update_statistic
            submission2.update_statistic
            submission3.update_statistic
            expect(subject.compute_satisfaction_information([course_user1, course_user2,
                                                             course_user3])).to eq([true, true, true])
          end
        end

        context 'when only one user does not meet the minimum watch percentage' do
          subject { create(:course_condition_video, video: video, minimum_watch_percentage: 50) }

          before do
            create(:video_session, :with_events_unclosed, submission: submission1)
            create(:video_session, :with_events_paused, submission: submission1)
            create(:video_session, :with_events_unclosed, submission: submission2)
            create(:video_session, :with_events_paused, submission: submission2)
          end

          it 'returns false for that user and true for rest' do
            # Sets percent_watched to 88
            submission1.update_statistic
            submission2.update_statistic
            expect(subject.compute_satisfaction_information([course_user1, course_user2,
                                                             course_user3])).to eq([true, true, false])
          end
        end

        context 'all users do not meet the minimum watch percentage' do
          subject { create(:course_condition_video, video: video, minimum_watch_percentage: 90) }

          before do
            create(:video_session, :with_events_unclosed, submission: submission1)
            create(:video_session, :with_events_paused, submission: submission1)
            create(:video_session, :with_events_unclosed, submission: submission2)
            create(:video_session, :with_events_paused, submission: submission2)
            create(:video_session, :with_events_unclosed, submission: submission3)
            create(:video_session, :with_events_paused, submission: submission3)
          end

          it 'returns false for all users' do
            # Sets percent_watched to 88
            submission1.update_statistic
            submission2.update_statistic
            submission3.update_statistic
            expect(subject.compute_satisfaction_information([course_user1, course_user2,
                                                             course_user3])).to eq([false, false, false])
          end
        end

        context 'all users did not watch the video (i.e. no submissions)' do
          subject { create(:course_condition_video, video: video, minimum_watch_percentage: 10) }

          it 'returns false for all users' do
            expect(subject.compute_satisfaction_information([course_user1, course_user2,
                                                             course_user3])).to eq([false, false, false])
          end
        end
      end
    end

    describe '#dependent_object' do
      it 'returns the correct dependent video object' do
        expect(subject.dependent_object).to eq(subject.video)
      end
    end

    describe '.dependent_class' do
      it 'returns Course::Video' do
        expect(Course::Condition::Video.dependent_class).to eq(Course::Video.name)
      end
    end

    describe '#on_dependent_status_change' do
      let(:course) { create(:course) }
      let(:student_user) { create(:course_student, course: course).user }
      let(:video) { create(:video, course: course) }
      let(:submission) { create(:video_submission, video: video, creator: student_user) }

      it 'evaluate_conditional_for the affected course_user' do
        expect(Course::Condition::Video).
          to receive(:evaluate_conditional_for).with(submission.course_user)
        submission.save!
      end
    end
  end
end
