# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::AutoGradingService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student_user) { create(:course_student, course: course).user }
    let(:assessment) { create(:assessment, :published_with_mrq_question, course: course) }
    let(:question) { assessment.questions.first }
    let(:answer) do
      submission = create(:submission, assessment: assessment, creator: student_user)
      create(:course_assessment_answer_multiple_response, :submitted,
             question: question, submission: submission).answer
    end
    let!(:auto_grading) { create(:course_assessment_answer_auto_grading, answer: answer) }

    describe '.grade' do
      subject { Course::Assessment::Answer::AutoGradingService.grade(answer) }

      context 'when the assessment is not autograded' do
        it 'evaluates the answer' do
          subject

          expect(answer).to be_evaluated
          expect(answer.grader).to be_nil
          expect(answer.grade).to be_nil
        end
      end

      context 'when the assessment is autograded' do
        before { allow(assessment).to receive(:autograded?).and_return(true) }

        it 'grades the answer' do
          subject

          expect(answer).to be_graded
          expect(answer.grade).to be_present
          expect(answer.grader).to be_present
        end
      end
    end
  end
end
