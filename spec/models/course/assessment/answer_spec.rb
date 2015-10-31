require 'rails_helper'

RSpec.describe Course::Assessment::Answer do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:submission) }
  it { is_expected.to belong_to(:question) }
  it { is_expected.to accept_nested_attributes_for(:actable) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { create(:course_assessment_answer) }

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

      describe '#submission' do
        context 'when the answer is being attempted' do
          it 'validates that the submission is being attempted' do
            subject.submission = build_stubbed(:course_assessment_submission,
                                               workflow_state: 'submitted')
            expect(subject.valid?).to be(false)
            expect(subject.errors[:submission]).not_to be_empty
          end
        end
      end

      describe '#submitted_at' do
        context 'when the answer is being attempted' do
          it 'is blank' do
            expect(subject.submitted_at).to be_nil
            subject.submitted_at = Time.zone.now
            subject.valid?
            expect(subject.errors[:submitted_at]).not_to be_empty
          end
        end

        context 'when the answer has been submitted' do
          let(:workflow_state) { 'submitted' }
          it 'is not blank' do
            subject.valid?
            expect(subject.errors[:submitted_at]).not_to be_empty
          end
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

      describe '#grader' do
        context 'when the answer is being attempted' do
          it 'cannot have a grade' do
            subject.grader = build(:user)
            expect(subject).not_to be_valid
            expect(subject.errors[:grader]).not_to be_empty
          end

          it 'must be less than or equal to the question maximum grade' do
            subject.grade = subject.question.maximum_grade + 1
            expect(subject).not_to be_valid
            expect(subject.errors[:grade]).not_to be_empty
          end
        end

        context 'when the answer is submitted' do
          let(:workflow_state) { 'submitted' }

          it 'must have a grade' do
            expect(subject).not_to be_valid
            expect(subject.errors[:grader]).not_to be_empty
          end
        end

        context 'when the answer is graded' do
          let(:workflow_state) { 'graded' }

          it 'must have a grade' do
            expect(subject).not_to be_valid
            expect(subject.errors[:grader]).not_to be_empty
          end
        end
      end
    end

    describe '#finalise!' do
      it 'sets the grade to 0' do
        subject.finalise!
        expect(subject.grade).to eq(0)
      end

      it 'sets submitted_at to the current time' do
        time = Time.zone.now
        subject.finalise!
        expect(subject.submitted_at).to be >= time
        expect(subject.submitted_at).to be <= Time.zone.now
      end
    end

    describe '#publish!' do
      before { subject.finalise! }
      it 'sets graded_at to the current time' do
        time = Time.zone.now
        subject.publish!
        expect(subject.graded_at).to be >= time
        expect(subject.graded_at).to be <= Time.zone.now
      end
    end
  end
end
