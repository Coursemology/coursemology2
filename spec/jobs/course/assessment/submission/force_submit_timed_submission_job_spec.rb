# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::ForceSubmitTimedSubmissionJob, type: :job do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course) }
    let(:end_at) { 1.hour.ago }
    let(:assessment) do
      create(:assessment, :with_mcq_question, course: course,
                                              end_at: end_at, is_late_submission_allowed: false)
    end
    let!(:submission) do
      create(:submission, :attempting, assessment: assessment,
                                       creator: student.user, course_user: student)
    end

    def run
      described_class.perform_later(assessment, submission.id).perform_now
    end

    context 'when the submission is attempting and past due' do
      it 'finalises the submission' do
        expect { run }.
          to change { submission.reload.workflow_state }.from('attempting').to('submitted')
      end
    end

    context 'when the submission is no longer attempting' do
      let!(:submission) do
        create(:submission, :submitted, assessment: assessment,
                                        creator: student.user, course_user: student)
      end

      it 'does nothing' do
        expect { run }.not_to(change { submission.reload.workflow_state })
      end
    end

    context 'when the deadline has since been extended into the future' do
      let(:end_at) { 1.hour.from_now }

      it 'does not finalise the submission' do
        expect { run }.not_to(change { submission.reload.workflow_state })
        expect(submission.reload).to be_attempting
      end
    end

    context 'when the submission no longer exists' do
      it 'does nothing' do
        id = submission.id
        submission.destroy!
        expect { described_class.perform_later(assessment, id).perform_now }.not_to raise_error
      end
    end
  end
end
