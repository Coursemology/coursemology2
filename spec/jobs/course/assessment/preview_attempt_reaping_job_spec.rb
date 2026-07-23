# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::PreviewAttemptReapingJob, type: :job do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_mcq_question, course: course) }
    let(:previewer) { create(:course_manager, course: course).user }
    let(:other_previewer) { create(:course_manager, course: course).user }

    it 'destroys preview attempts older than the TTL' do
      old_preview = create(:course_assessment_attempt, assessment: assessment, creator: previewer)
      old_preview.update_column(:created_at, (described_class::TTL + 1.day).ago)

      expect { described_class.perform_now }.
        to change { Course::Assessment::Attempt.where(id: old_preview.id).exists? }.from(true).to(false)
    end

    it 'keeps preview attempts newer than the TTL' do
      fresh_preview = create(:course_assessment_attempt, assessment: assessment, creator: other_previewer)
      fresh_preview.update_column(:created_at, (described_class::TTL - 1.day).ago)

      expect { described_class.perform_now }.
        not_to(change { Course::Assessment::Attempt.where(id: fresh_preview.id).exists? })
    end

    it 'never destroys a real submission even if it is old' do
      submission = create(:course_assessment_submission, assessment: assessment)
      submission.attempt.update_column(:created_at, (described_class::TTL + 1.day).ago)

      expect { described_class.perform_now }.
        not_to(change { Course::Assessment::Attempt.where(id: submission.attempt_id).exists? })
    end
  end
end
