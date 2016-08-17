# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::AutoGradingService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:answer) do
      create(:course_assessment_answer_multiple_response, :submitted,
             submission_traits: [{ auto_grade: false }]).answer
    end
    let!(:auto_grading) { create(:course_assessment_answer_auto_grading, answer: answer) }

    describe '.grade' do
      subject { Course::Assessment::Answer::AutoGradingService.grade(answer) }

      it 'grades the answer' do
        subject

        expect(auto_grading.answer).to be_graded
      end
    end

    describe '#grade' do
      it "sets the answer's status to graded" do
        result = subject.grade(answer)
        expect(result).to be_graded
      end

      it "sets the answer's grader to the system account" do
        result = subject.grade(answer)
        expect(result.grader).to eq(User.system)
      end
    end
  end
end
