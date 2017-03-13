# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::AnswersEvaluationService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    # Used MCQ question here because we are not able to run programming auto grading in tests
    let(:question) { create(:course_assessment_question_multiple_response) }
    let(:student) { create(:course_student, course: question.assessment.course).user }
    let!(:submission) do
      create(:submission, :graded, assessment: question.assessment, creator: student)
    end
    let!(:answers) { submission.answers }
    subject { Course::Assessment::Question::AnswersEvaluationService.new(question) }

    describe '#call' do
      before { subject.call }

      it 'auto grades the associated answers' do
        expect(answers.all?(&:graded?)).to be_truthy
      end
    end
  end
end
