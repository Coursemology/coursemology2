# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Conditional::ConditionalSatisfiabilityEvaluationJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course_user) { create(:course_user) }
    subject { Course::Conditional::ConditionalSatisfiabilityEvaluationJob }

    it 'can be queued' do
      expect { subject.perform_later(course_user) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'evaluate the satisfiability of the conditionals for the course user' do
      evaluation_job = subject.perform_later(course_user)
      evaluation_job.perform_now
      expect(evaluation_job.job).to be_completed
      # TODO: Expect course user to be awarded satisfied conditionals after conditional's API are
      # added in.
    end
  end
end
