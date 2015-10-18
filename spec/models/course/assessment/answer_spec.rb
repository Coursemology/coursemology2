require 'rails_helper'

RSpec.describe Course::Assessment::Answer do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:submission) }
  it { is_expected.to belong_to(:question) }
  it { is_expected.to accept_nested_attributes_for(:actable) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe 'validations' do
      subject { build_stubbed(:course_assessment_answer, workflow_state: workflow_state) }
      let(:workflow_state) { 'attempting' }

      describe '#question' do
        it 'validates that the assessment is consistent' do
          subject.question = build_stubbed(:course_assessment_question)
          expect(subject.question.assessment).not_to eq(subject.submission.assessment)
          expect(subject.valid?).to be(false)
          expect(subject.errors[:question]).to include(
            I18n.t('activerecord.errors.models.course/assessment/answer.attributes.question'\
              '.consistent_assessment'))
        end
      end

      describe '#grade' do
        context 'when the answer is being attempted' do
          it 'cannot have a grade' do
            subject.grade = 0
            expect(subject).not_to be_valid
            expect(subject.errors[:grade]).not_to be_empty
          end
        end

        context 'when the answer is finalised' do
          subject { create(:course_assessment_answer) }
          it 'has a grade of 0' do
            subject.submit!
            expect(subject).to be_valid
            expect(subject.grade).to eq(0)
          end
        end

        context 'when the answer is submitted' do
          let(:workflow_state) { 'submitted' }

          it 'must have a grade' do
            expect(subject).not_to be_valid
            expect(subject.errors[:grade]).not_to be_empty
          end
        end

        context 'when the answer is graded' do
          let(:workflow_state) { 'graded' }

          it 'must have a grade' do
            expect(subject).not_to be_valid
            expect(subject.errors[:grade]).not_to be_empty
          end
        end
      end
    end
  end
end
