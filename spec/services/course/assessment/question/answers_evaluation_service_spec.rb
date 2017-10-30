# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::AnswersEvaluationService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    # Used MCQ question here because we are not able to run programming auto grading in tests
    let(:assessment) { create(:assessment) }
    let(:question) { create(:course_assessment_question_multiple_response, assessment: assessment) }
    let(:student) { create(:course_student, course: assessment.course).user }
    let!(:submission) do
      create(:submission, :submitted, assessment: assessment, creator: student)
    end
    let!(:answers) { submission.answers }
    subject { Course::Assessment::Question::AnswersEvaluationService.new(question) }

    describe '#call' do
      before { subject.call }

      it 'auto grades the associated answers' do
        wait_for_job
        answers.each(&:reload)
        expect(answers.all?(&:evaluated?)).to be_truthy
      end
    end
  end
end
