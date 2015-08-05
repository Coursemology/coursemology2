require 'rails_helper'

RSpec.describe Course::Assessment do
  it { is_expected.to act_as(:lesson_plan_item) }
  it { is_expected.to belong_to(:tab) }
  it { is_expected.to have_many(:questions).dependent(:destroy) }
  it { is_expected.to have_many(:multiple_response_questions).through(:questions) }
  it { is_expected.to have_many(:submissions).dependent(:destroy) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.questions' do
      describe '#attempt' do
        let(:assessment) do
          assessment = build(:assessment)
          create_list(:course_assessment_question_multiple_response, 3, assessment: assessment)
          assessment
        end
        let(:submission) { create(:course_assessment_submission, assessment: assessment) }
        let(:answers) { assessment.questions.attempt(submission) }

        context 'when some questions are being attempted' do
          before do
            assessment.questions.limit(1).attempt(submission).tap do |answers|
              answers.each(&:save)
            end
          end

          it 'instantiates new answers' do
            expect(answers.first.persisted?).to be(true)
            expect(answers.drop(1).any?(&:persisted?)).to be(false)
          end
        end

        context 'when all questions are being attempted' do
          before do
            assessment.questions.attempt(submission).tap do |answers|
              answers.each(&:save)
            end
          end

          it 'reuses all existing answers' do
            expect(answers.all?(&:persisted?)).to be(true)
          end
        end

        context 'when some questions have been submitted' do
          before do
            assessment.questions.limit(1).attempt(submission).tap do |answers|
              answers.each(&:save!)
              answers.each(&:submit!)
            end
          end

          it 'creates a new answer' do
            expect(answers.all?(&:persisted?)).to be(false)
          end
        end
      end
    end
  end
end
