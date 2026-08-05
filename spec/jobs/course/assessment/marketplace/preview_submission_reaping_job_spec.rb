# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewSubmissionReapingJob, type: :job do
  # Own instance: at most one `preview: true` course may exist per instance, and the job runs
  # `without_tenant`, so it reaps this course's submissions wherever the course lives.
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:ttl) { described_class::PREVIEW_SUBMISSION_TTL }

    subject { described_class.perform_now }

    # `update_column` bypasses `updated_at`'s own touch, unlike `update!`/`touch`.
    def age!(submission, ago:)
      submission.update_column(:updated_at, ago)
    end

    context 'a preview submission older than the TTL' do
      let!(:preview_course) { create(:course, preview: true) }
      let!(:preview_assessment) { create(:assessment, :with_mcq_question, course: preview_course) }
      let!(:previewer) { create(:user) }
      let!(:aged_submission) do
        submission = create(:submission, :attempting, assessment: preview_assessment,
                                                      course: preview_course, creator: previewer)
        age!(submission, ago: (ttl + 1.hour).ago)
        submission
      end

      it 'reaps the aged preview submission' do
        expect { subject }.
          to change { Course::Assessment::Submission.exists?(aged_submission.id) }.from(true).to(false)
      end

      it 'cascades: the reaped submission\'s answers are destroyed too' do
        expect { subject }.
          to change { Course::Assessment::Answer.where(submission_id: aged_submission.id).exists? }.
          from(true).to(false)
      end

      it 'leaves the preview course, the assessment, and the enrolment alone' do
        subject

        expect(Course.exists?(preview_course.id)).to be(true)
        expect(Course::Assessment.exists?(preview_assessment.id)).to be(true)
        expect(preview_course.course_users.exists?(user_id: previewer.id)).to be(true)
      end
    end

    context 'a preview submission within the TTL grace period' do
      let!(:preview_course) { create(:course, preview: true) }
      let!(:preview_assessment) { create(:assessment, :with_mcq_question, course: preview_course) }
      let!(:previewer) { create(:user) }
      let!(:fresh_submission) do
        create(:submission, :attempting, assessment: preview_assessment,
                                         course: preview_course, creator: previewer)
      end

      it 'spares the submission' do
        expect { subject }.
          not_to(change { Course::Assessment::Submission.exists?(fresh_submission.id) })
      end
    end

    # The highest-value example: proves the job scopes to `preview: true` courses rather than
    # reaping any old submission it finds.
    context 'a NON-preview submission of the same age' do
      let!(:normal_course) { create(:course) }
      let!(:normal_assessment) { create(:assessment, :with_mcq_question, course: normal_course) }
      let!(:normal_user) { create(:user) }
      let!(:aged_normal_submission) do
        submission = create(:submission, :attempting, assessment: normal_assessment,
                                                      course: normal_course, creator: normal_user)
        age!(submission, ago: (ttl + 1.hour).ago)
        submission
      end

      it 'spares the non-preview submission' do
        expect { subject }.
          not_to(change { Course::Assessment::Submission.exists?(aged_normal_submission.id) })
      end
    end
  end
end
