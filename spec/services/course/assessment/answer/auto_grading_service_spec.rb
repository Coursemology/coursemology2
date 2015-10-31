require 'rails_helper'

RSpec.describe Course::Assessment::Answer::AutoGradingService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:answer) { build(:course_assessment_answer_multiple_response).answer }
    let(:auto_grading) { build(:course_assessment_answer_auto_grading, answer: answer) }

    describe '.grade' do
      subject { Course::Assessment::Answer::AutoGradingService.grade(auto_grading) }

      it 'grades the grading' do
        subject

        expect(auto_grading).to be_graded
      end
    end

    describe '#grade' do
      it 'sets the status to graded' do
        expect(subject.grade(auto_grading)).to eq(true)
        expect(auto_grading).to be_graded
      end
    end
  end
end
