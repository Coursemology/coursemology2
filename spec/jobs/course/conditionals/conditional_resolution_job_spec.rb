# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Conditional::ConditionalResolutionJob do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course_user) { create(:course_user) }
    subject { Course::Conditional::ConditionalResolutionJob }

    it 'can be queued' do
      expect { subject.perform_later(course_user) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'resolve the conditionals for the course user' do
      resolution_job = subject.perform_later(course_user)
      resolution_job.perform_now
      expect(resolution_job.job).to be_completed
      # TODO: Expect course user to be awarded satisfied conditionals after conditional's API are
      # added in.
    end
  end
end
