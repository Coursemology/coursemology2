# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::AutoGradingJob do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Course::Assessment::Answer::AutoGradingJob }
    let(:answer) { create(:course_assessment_answer_multiple_response, :submitted).answer }
    let!(:auto_grading) { create(:course_assessment_answer_auto_grading, answer: answer) }

    it 'can be queued' do
      expect { subject.perform_later(auto_grading) }.to \
        have_enqueued_job(subject).exactly(:once)
    end

    it 'grades answers' do
      subject.perform_now(auto_grading)
      expect(auto_grading.answer).to be_graded
    end
  end
end
