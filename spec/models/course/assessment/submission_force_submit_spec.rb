# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course) }
    let(:assessment) do
      create(:assessment, :with_mcq_question, course: course,
                                              time_limit: time_limit, end_at: end_at,
                                              is_late_submission_allowed: late_allowed)
    end
    let(:time_limit) { nil }
    let(:end_at) { nil }
    let(:late_allowed) { true }
    let(:submission) do
      create(:submission, :attempting, assessment: assessment, creator: student.user, course_user: student)
    end
    let(:delay) { Course::Assessment::Submission::FORCE_SUBMIT_DELAY }

    describe '#force_submit_at' do
      subject { submission.force_submit_at }

      context 'with neither a time limit nor an enforced deadline' do
        it { is_expected.to be_nil }
      end

      context 'with only a time limit' do
        let(:time_limit) { 30 }

        it 'is the time-limit expiry from creation' do
          is_expected.to be_within(1.second).of(submission.created_at + 30.minutes)
        end
      end

      context 'with only an enforced deadline' do
        let(:late_allowed) { false }
        let(:end_at) { 20.minutes.from_now }

        it { is_expected.to be_within(1.second).of(end_at) }
      end

      context 'with both, where the deadline is earlier' do
        let(:time_limit) { 180 }
        let(:late_allowed) { false }
        let(:end_at) { 20.minutes.from_now }

        it 'is the earlier of the two' do
          is_expected.to be_within(1.second).of(end_at)
        end
      end

      context 'when the submission has been unsubmitted' do
        let(:time_limit) { 30 }
        let(:late_allowed) { false }
        let(:end_at) { 20.minutes.from_now }

        before { submission.update_column(:unsubmitted_at, Time.zone.now) }

        it 'is exempt and has no force-submit time' do
          is_expected.to be_nil
        end
      end

      context 'when the submission was created after the deadline (e.g. a staff test run)' do
        let(:late_allowed) { false }
        let(:end_at) { 20.minutes.ago }

        it 'does not enforce the already-passed deadline' do
          is_expected.to be_nil
        end

        context 'but a time limit still applies' do
          let(:time_limit) { 30 }

          it 'still enforces the time limit from creation' do
            is_expected.to be_within(1.second).of(submission.created_at + 30.minutes)
          end
        end
      end

      context 'when the submission was created before a since-passed deadline' do
        let(:late_allowed) { false }
        let(:end_at) { 20.minutes.ago }

        before { submission.update_column(:created_at, 1.hour.ago) }

        it 'still enforces the deadline (the student began in time)' do
          is_expected.to be_within(1.second).of(end_at)
        end
      end
    end

    describe 'the unsubmit and finalise events' do
      let(:late_allowed) { false }
      let(:end_at) { 20.minutes.from_now }
      let(:submission) do
        create(:submission, :submitted, assessment: assessment, creator: student.user, course_user: student)
      end

      it 'sets unsubmitted_at on unsubmit and clears it on re-finalise' do
        expect { submission.update!('unsubmit' => true) }.
          to change { submission.reload.unsubmitted_at }.from(nil).to(be_present)
        expect { submission.update!('finalise' => true) }.
          to change { submission.reload.unsubmitted_at }.to(nil)
      end
    end

    describe '#force_submit_job_at' do
      let(:late_allowed) { false }
      let(:end_at) { 20.minutes.from_now }

      it 'adds the grace period to the force-submit time' do
        expect(submission.force_submit_job_at).to be_within(1.second).of(end_at + delay)
      end
    end

    describe '#force_submit_overdue?' do
      let(:late_allowed) { false }
      # An overdue attempt was necessarily begun before its deadline.
      before { submission.update_column(:created_at, 1.hour.ago) }

      context 'when past the force-submit time plus grace' do
        let(:end_at) { (10.minutes + delay).before(Time.zone.now) }

        it { expect(submission.force_submit_overdue?).to be true }
      end

      context 'when still within the grace period' do
        let(:end_at) { 1.minute.ago }

        it { expect(submission.force_submit_overdue?).to be false }
      end

      context 'when the submission is not attempting' do
        let(:end_at) { 1.hour.ago }
        let(:submission) do
          create(:submission, :submitted, assessment: assessment, creator: student.user, course_user: student)
        end

        it { expect(submission.force_submit_overdue?).to be false }
      end
    end

    describe '#force_submit!' do
      let(:late_allowed) { false }
      let(:end_at) { 1.hour.ago }

      it 'finalises the submission, attributed to the creator' do
        expect { submission.force_submit! }.
          to change { submission.reload.workflow_state }.from('attempting').to('submitted')
      end
    end

    describe 'scheduling a force-submit job on creation' do
      let(:force_submit_job) { Course::Assessment::Submission::ForceSubmitTimedSubmissionJob }

      def enqueued_for(submission)
        ActiveJob::Base.queue_adapter.enqueued_jobs.
          select { |job| job[:job] == force_submit_job && job[:args][1] == submission.id }
      end

      with_active_job_queue_adapter(:test) do
        context 'when the force-submit time is within the scheduling horizon' do
          let(:late_allowed) { false }
          let(:end_at) { 30.minutes.from_now }

          it 'schedules the job at the force-submit time plus grace' do
            submission = create(:submission, :attempting, assessment: assessment,
                                                          creator: student.user, course_user: student)
            jobs = enqueued_for(submission)
            expect(jobs.size).to eq(1)
            expect(Time.zone.at(jobs.first[:at])).to be_within(5.seconds).of(end_at + delay)
          end
        end

        context 'when the force-submit time is beyond the scheduling horizon' do
          let(:late_allowed) { false }
          let(:end_at) { 8.hours.from_now }

          it 'does not schedule a job (the sweep will pick it up later)' do
            submission = create(:submission, :attempting, assessment: assessment,
                                                          creator: student.user, course_user: student)
            expect(enqueued_for(submission)).to be_empty
          end
        end

        context 'when the submission is never force-submitted' do
          it 'does not schedule a job' do
            submission = create(:submission, :attempting, assessment: assessment,
                                                          creator: student.user, course_user: student)
            expect(enqueued_for(submission)).to be_empty
          end
        end
      end
    end
  end
end
