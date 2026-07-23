# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::PreviewAttemptReapingJob, type: :job do
  include ActiveSupport::Testing::TimeHelpers

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    it 'destroys preview attempts older than the TTL and leaves fresh ones' do
      stale = create(:course_assessment_preview_attempt, created_at: 8.days.ago)
      fresh = create(:course_assessment_preview_attempt, created_at: 1.hour.ago)
      expect { described_class.perform_now }.
        to change { Course::Assessment::PreviewAttempt.exists?(stale.id) }.from(true).to(false)
      expect(Course::Assessment::PreviewAttempt.exists?(fresh.id)).to be(true)
    end

    it 'destroys an attempt exactly at the TTL boundary (inclusive endless range)' do
      # Freeze time so the row's created_at and the job's internal TTL.ago are the SAME instant —
      # otherwise wall-clock drift makes the row strictly older and passes for the wrong reason.
      # This is the only test that catches a `..TTL.ago` → `...TTL.ago` (exclusive) regression.
      travel_to(Time.current) do
        boundary = create(:course_assessment_preview_attempt, created_at: described_class::TTL.ago)
        described_class.perform_now
        expect(Course::Assessment::PreviewAttempt.exists?(boundary.id)).to be(false)
      end
    end

    it 'cascades answers of a reaped attempt' do
      stale = create(:course_assessment_preview_attempt, created_at: 8.days.ago)
      stale.create_new_answers
      expect { described_class.perform_now }.to change { stale.answers.count }.from(1).to(0)
    end

    it 'cascades submission_questions of a reaped attempt' do
      # create_new_answers does NOT build submission_questions — build one directly to prove the
      # `has_many :submission_questions, dependent: :destroy` declaration is real.
      stale = create(:course_assessment_preview_attempt, created_at: 8.days.ago)
      stale.submission_questions.create!(question: stale.assessment.questions.first)
      expect { described_class.perform_now }.
        to change { stale.submission_questions.count }.from(1).to(0)
    end
  end
end
