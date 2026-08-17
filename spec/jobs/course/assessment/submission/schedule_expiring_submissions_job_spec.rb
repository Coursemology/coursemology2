# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::ScheduleExpiringSubmissionsJob, type: :job do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course) }
    let(:delay) { Course::Assessment::Submission::FORCE_SUBMIT_DELAY }
    let(:assessment) do
      create(:assessment, :with_mcq_question, course: course,
                                              end_at: end_at, is_late_submission_allowed: late_allowed)
    end
    let(:late_allowed) { false }
    let(:end_at) { 10.minutes.from_now }
    let!(:submission) do
      create(:submission, :attempting, assessment: assessment,
                                       creator: student.user, course_user: student)
    end

    let(:force_submit_job) { Course::Assessment::Submission::ForceSubmitTimedSubmissionJob }

    # Global sweep on a shared, non-rolled-back database: assert on this submission's jobs only.
    def enqueued_for(submission)
      ActiveJob::Base.queue_adapter.enqueued_jobs.
        select { |job| job[:job] == force_submit_job && job[:args][1] == submission.id }
    end

    with_active_job_queue_adapter(:test) do
      # Discard anything scheduled at creation so each example asserts on the sweep's behaviour alone.
      subject(:run) do
        ActiveJob::Base.queue_adapter.enqueued_jobs.clear
        described_class.perform_now
      end

      context 'when a submission is imminent but was not scheduled at creation' do
        # Deadline was beyond the horizon at creation (so nothing was scheduled), now brought near.
        let(:end_at) { 8.hours.from_now }
        let(:new_end_at) { 10.minutes.from_now }

        before { assessment.update!(end_at: new_end_at) }

        it 'schedules a force-submit job at the force-submit time plus grace' do
          run
          jobs = enqueued_for(submission)
          expect(jobs.size).to eq(1)
          expect(Time.zone.at(jobs.first[:at])).to be_within(5.seconds).of(new_end_at + delay)
        end
      end

      context 'when a submission is past due (its scheduled job was lost)' do
        let(:end_at) { (10.minutes + delay).before(Time.zone.now) }

        # The attempt was begun before the deadline it has since blown past.
        before { submission.update_column(:created_at, 1.hour.ago) }

        it 'schedules an immediate force-submit job' do
          run
          jobs = enqueued_for(submission)
          expect(jobs.size).to eq(1)
          expect(Time.zone.at(jobs.first[:at])).to be_within(10.seconds).of(Time.zone.now)
        end
      end

      context 'when the submission is not yet imminent' do
        let(:end_at) { 2.hours.from_now }

        it 'does not schedule a job' do
          run
          expect(enqueued_for(submission)).to be_empty
        end
      end

      context 'when the submission was already scheduled at creation and is not yet due' do
        # end_at within the horizon => scheduled at creation; also within the sweep window.
        let(:end_at) { 10.minutes.from_now }

        it 'does not re-schedule it' do
          run
          expect(enqueued_for(submission)).to be_empty
        end
      end

      context 'when the deadline was extended after the submission was scheduled at creation' do
        # Scheduled at creation for a soon deadline, then extended to a new time within the window.
        let(:end_at) { 5.minutes.from_now }
        let(:new_end_at) { 15.minutes.from_now }

        before { assessment.update!(end_at: new_end_at) }

        it 're-schedules it for the new deadline' do
          run
          jobs = enqueued_for(submission)
          expect(jobs.size).to eq(1)
          expect(Time.zone.at(jobs.first[:at])).to be_within(5.seconds).of(new_end_at + delay)
        end
      end

      context 'when the submission has been unsubmitted' do
        let(:end_at) { (10.minutes + delay).before(Time.zone.now) }
        let!(:submission) do
          create(:submission, :submitted, assessment: assessment,
                                          creator: student.user, course_user: student).
            tap { |s| s.update!('unsubmit' => true) }
        end

        it 'does not schedule a job' do
          run
          expect(enqueued_for(submission)).to be_empty
        end
      end

      context 'when late submissions are allowed and there is no time limit' do
        let(:late_allowed) { true }
        let(:end_at) { 1.hour.ago }

        it 'does not schedule a job' do
          run
          expect(enqueued_for(submission)).to be_empty
        end
      end
    end
  end
end
