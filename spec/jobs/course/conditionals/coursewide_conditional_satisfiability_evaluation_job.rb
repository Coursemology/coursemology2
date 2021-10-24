# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Conditional::CoursewideConditionalSatisfiabilityEvaluationJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:users) { create_list(:course_user, 2, course: course) }
    subject { Course::Conditional::CoursewideConditionalSatisfiabilityEvaluationJob }

    it 'can be queued' do
      expect { subject.perform_later(course, Time.now) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'completes successfully' do
      job_time = Time.now
      allow(course).to receive(:conditional_satisfiability_evaluation_time).and_return(job_time)
      allow(course).to receive(:instance).and_return(course)

      evaluation_job = subject.perform_later(course, job_time)
      evaluation_job.perform_now

      expect(evaluation_job.job).to be_completed
    end

    it 'evaluates the satisfiability of the conditionals for all course users' do
      job_time = Time.now
      allow(course).to receive(:conditional_satisfiability_evaluation_time).and_return(job_time)
      allow(course).to receive(:instance).and_return(course)
      allow(Course::Conditional::ConditionalSatisfiabilityEvaluationService).to receive(:evaluate).and_return(true)

      evaluation_job = subject.perform_later(course, job_time)

      users.each do |user|
        expect(Course::Conditional::ConditionalSatisfiabilityEvaluationService).
          to receive(:evaluate).with(user)
      end

      evaluation_job.perform_now
    end

    it 'does not perform the evaluation if there is another more recent job scheduled' do
      job_time = Time.now
      allow(course).to receive(:conditional_satisfiability_evaluation_time).and_return(job_time + 1.minutes)
      allow(course).to receive(:instance).and_return(course)
      allow(Course::Conditional::ConditionalSatisfiabilityEvaluationService).to receive(:evaluate).and_return(true)

      evaluation_job = subject.perform_later(course, job_time)

      expect(Course::Conditional::ConditionalSatisfiabilityEvaluationService).
          not_to receive(:evaluate)

      evaluation_job.perform_now
    end
  end
end
