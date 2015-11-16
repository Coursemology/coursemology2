require 'rails_helper'

RSpec.describe Course::Assessment::Answer::AutoGradingService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:answer) { create(:course_assessment_answer_multiple_response, :submitted).answer }
    let(:auto_grading) { create(:course_assessment_answer_auto_grading, answer: answer) }

    describe '.grade' do
      subject { Course::Assessment::Answer::AutoGradingService.grade(auto_grading) }

      it 'grades the answer' do
        subject

        expect(auto_grading.answer).to be_graded
      end
    end

    describe '#grade' do
      it "sets the answer's status to graded" do
        expect(subject.grade(auto_grading)).to eq(true)
        expect(auto_grading.answer).to be_graded
      end

      it "sets the answer's grader to the system account" do
        expect(subject.grade(auto_grading)).to eq(true)
        expect(auto_grading.answer.grader).to eq(User.system)
      end
    end
  end
end
