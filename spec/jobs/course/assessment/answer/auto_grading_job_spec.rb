require 'rails_helper'

# TODO: Rewrite using new RSpec matchers when upgrading to RSpec >= 3.4
RSpec.describe Course::Assessment::Answer::AutoGradingJob do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Course::Assessment::Answer::AutoGradingJob }
    let(:auto_grading) { build(:course_assessment_answer_auto_grading) }

    it 'grades answers' do
      auto_grading.save!
      expect { subject.perform_later(auto_grading) }.to \
        change { ActiveJob::Base.queue_adapter.enqueued_jobs.count }.by(1)

      pending 'Graders'
      subject.perform_now(auto_grading)
      expect(auto_grading).to be_graded
    end
  end
end
