# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ReducePriorityAutoGradingJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Course::Assessment::Answer::ReducePriorityAutoGradingJob }
    let(:course) { create(:course) }
    let(:student_user) { create(:course_student, course: course).user }
    let(:assessment) do
      create(:assessment, :published_with_mrq_question, course: course)
    end
    let(:question) { assessment.questions.first }
    let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
    let(:answer) do
      create(:course_assessment_answer_multiple_response, :submitted,
             assessment: assessment, submission: submission, question: question).answer
    end
    let!(:auto_grading) { create(:course_assessment_answer_auto_grading, answer: answer) }

    it 'can be queued' do
      expect { subject.perform_later(answer) }.to \
        have_enqueued_job(subject).exactly(:once).on_queue('medium_high')
    end

    it 'evaluates answers' do
      subject.perform_now(answer)
      expect(answer).to be_evaluated
    end
  end
end
