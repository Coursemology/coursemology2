# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Attempt, type: :model do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_mcq_question, course: course) }
    let(:previewer) { create(:course_manager, course: course).user }

    describe '#preview?' do
      it 'is true for a bare attempt with no submission extension' do
        attempt = create(:course_assessment_attempt, assessment: assessment, creator: previewer)
        expect(attempt.preview?).to be(true)
      end

      it 'is false for an attempt that has a submission extension' do
        submission = create(:course_assessment_submission, assessment: assessment)
        expect(submission.attempt.preview?).to be(false)
      end
    end

    # Characterization of the EXISTING (unchanged) one-attempt-per-creator rule that preview create-or-reuse
    # relies on: normal preview creation is allowed (no prior attempt), and a prior attempt yields the
    # friendly collision error rather than a raw DB error. No production code changes for this describe.
    describe '#validate_unique_submission (relied on by preview create-or-reuse)' do
      it 'allows creating a preview attempt when the creator has no prior attempt' do
        expect do
          create(:course_assessment_attempt, assessment: assessment, creator: previewer)
        end.to change { Course::Assessment::Attempt.where(creator: previewer).count }.by(1)
      end

      it 'blocks a second attempt for the same creator with the friendly error' do
        create(:course_assessment_attempt, assessment: assessment, creator: previewer)
        second = build(:course_assessment_attempt, assessment: assessment, creator: previewer)
        expect(second).not_to be_valid
        expect(second.errors[:base]).
          to include(I18n.t('activerecord.errors.models.course/assessment/' \
                            'submission.submission_already_exists'))
      end
    end

    describe 'course-coupled interface delegation (lets an Attempt serve as @submission)' do
      it 'returns nil for a preview attempt (no extension row)' do
        attempt = create(:course_assessment_attempt, assessment: assessment, creator: previewer)
        expect(attempt.course_user).to be_nil
        expect(attempt.current_points_awarded).to be_nil
        expect(attempt.experience_points_record).to be_nil
        expect(attempt.publisher).to be_nil
      end

      it 'delegates to the extension for a real submission' do
        submission = create(:course_assessment_submission, assessment: assessment)
        attempt = submission.attempt
        expect(attempt.course_user).to eq(submission.course_user)
        expect(attempt.experience_points_record).to eq(submission.experience_points_record)
      end
    end

    describe '#reset_attempt!' do
      it 'destroys existing answers, returns to attempting, and rebuilds answers' do
        attempt = create(:course_assessment_attempt, assessment: assessment, creator: previewer)
        attempt.create_new_answers
        attempt.answers.each { |answer| answer.update_column(:workflow_state, 'submitted') }
        attempt.update_columns(workflow_state: 'submitted', submitted_at: Time.zone.now)
        original_answer_ids = attempt.answers.reload.map(&:id)
        expect(original_answer_ids).not_to be_empty

        attempt.reset_attempt!
        attempt.reload

        expect(attempt.workflow_state).to eq('attempting')
        expect(attempt.submitted_at).to be_nil
        expect(attempt.published_at).to be_nil
        expect(attempt.answers.map(&:id) & original_answer_ids).to be_empty
        expect(attempt.answers).not_to be_empty
        expect(attempt.answers.map(&:workflow_state)).to all(eq('attempting'))
      end
    end
  end
end
