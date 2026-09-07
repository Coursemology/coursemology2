# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::PublishTaskCompletionJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:course_student) { create(:course_student, course: course) }
    let(:submission) do
      create(:submission, :attempting, assessment: assessment,
                                       creator: course_student.user, course_user: course_student)
    end
    subject { Course::Assessment::Submission::PublishTaskCompletionJob }

    it 'can be queued' do
      expect { subject.perform_later(submission) }.to have_enqueued_job(subject).exactly(:once)
    end

    it 'pushes the current status' do
      allow(submission).to receive(:should_publish_task_completion?).and_return(true)
      expect(submission).to receive(:publish_task_completion!)

      subject.perform_now(submission)
    end

    # Re-read at run time rather than trusted from enqueue time, so a superseded push is dropped.
    it 'does not push when the submission no longer qualifies' do
      allow(submission).to receive(:should_publish_task_completion?).and_return(false)
      expect(submission).not_to receive(:publish_task_completion!)

      subject.perform_now(submission)
    end

    it 'lets a failed push propagate, so Sidekiq retries and Rollbar records it' do
      allow(submission).to receive(:should_publish_task_completion?).and_return(true)
      allow(submission).to receive(:publish_task_completion!).and_raise(StandardError, 'cikgo down')

      expect { subject.perform_now(submission) }.to raise_error(StandardError, 'cikgo down')
    end
  end
end
