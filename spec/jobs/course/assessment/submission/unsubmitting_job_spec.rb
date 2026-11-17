# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::UnsubmittingJob, type: :job do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:instructor) { create(:course_manager, course: course).user }
    let(:student) { create(:course_student, course: course) }
    let(:assessment) { create(:assessment, :with_all_question_types, course: course) }
    let!(:submission) do
      create(:submission, :graded, assessment: assessment, creator: student.user, course_user: student)
    end

    def run
      described_class.perform_later(instructor, [submission.id], assessment).perform_now
    end

    # Unmarking a graded submission first queued its auto grading, which graded the drafts that the unsubmit
    # created.
    context 'when the submission is graded' do
      with_active_job_queue_adapter(:test) do
        it 'unsubmits it without queueing auto grading' do
          expect { run }.not_to have_enqueued_job(Course::Assessment::Submission::AutoGradingJob)

          expect(submission.reload).to be_attempting
          expect(submission.current_answers).to all(be_attempting)
        end
      end
    end
  end
end
