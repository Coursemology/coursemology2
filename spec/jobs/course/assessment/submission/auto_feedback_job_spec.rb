# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::AutoFeedbackJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Course::Assessment::Submission::AutoFeedbackJob }
    let!(:course) { create(:course) }
    let!(:assessment) { create(:assessment, course: course) }
    let!(:submission) { create(:submission, auto_grade: false, assessment: assessment, creator: course.creator) }
    let(:question) do
      create(:course_assessment_question_programming,
             assessment: assessment,
             maximum_grade: 7,
             with_codaveri_question: true)
    end
    let!(:answer) do
      create(:course_assessment_answer_programming, :submitted, current_answer: true,
                                                                question: question.acting_as,
                                                                submission: submission).answer
    end

    it 'can be queued' do
      expect { subject.perform_later(submission) }.to \
        have_enqueued_job(subject).exactly(:once)
    end

    it 'can be run and creates an evaluation job for the answer' do
      submission.update!(workflow_state: 'submitted', submitted_at: Time.now)
      subject.perform_now(submission)
      expect(answer.reload.actable.codaveri_feedback_job_id).not_to be_nil
    end
  end
end
