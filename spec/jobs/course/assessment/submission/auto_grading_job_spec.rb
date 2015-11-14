require 'rails_helper'

# TODO: Rewrite using new RSpec matchers when upgrading to RSpec >= 3.4
RSpec.describe Course::Assessment::Submission::AutoGradingJob do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Course::Assessment::Submission::AutoGradingJob }
    let(:answer) { create(:course_assessment_answer_multiple_response, :submitted).answer }
    let(:submission) { answer.submission.tap { |submission| submission.answers.reload } }
    let(:question) { answer.question.specific }

    it 'grades submissions' do
      expect { subject.perform_later(submission) }.to \
        change { ActiveJob::Base.queue_adapter.enqueued_jobs.count }.by(1)

      subject.perform_now(submission)
      expect(submission).to be_graded
    end
  end
end
