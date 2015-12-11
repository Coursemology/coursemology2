require 'rails_helper'

RSpec.describe Course::Assessment::Submission::AutoGradingJob do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Course::Assessment::Submission::AutoGradingJob }
    let(:answer) { create(:course_assessment_answer_multiple_response, :submitted).answer }
    let!(:submission) { answer.submission.tap { |submission| submission.answers.reload } }
    let(:question) { answer.question.specific }

    it 'can be queued' do
      expect { subject.perform_later(submission) }.to \
        have_enqueued_job(subject).exactly(:once).on_queue('lowest')
    end

    with_active_job_queue_adapter(:background_thread) do
      it 'grades submissions' do
        subject.perform_now(submission)
        expect(submission.answers.map(&:reload).all?(&:graded?)).to be(true)
      end
    end

    with_active_job_queue_adapter(:inline) do
      context 'when the job is complete' do
        it 'redirects to the submission edit page' do
          singleton_class.class_eval { include Rails.application.routes.url_helpers }
          job = subject.perform_later(submission).tap(&:wait).job.tap(&:reload)

          expect(job.redirect_to).to \
            eq(edit_course_assessment_submission_path(submission.assessment.course,
                                                      submission.assessment, submission))
        end
      end
    end
  end
end
