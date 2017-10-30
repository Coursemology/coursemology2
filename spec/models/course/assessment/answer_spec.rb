# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:submission) }
  it { is_expected.to belong_to(:question) }
  it { is_expected.to accept_nested_attributes_for(:actable) }
  it { is_expected.to have_one(:auto_grading).dependent(:destroy) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { create(:course_assessment_answer) }

    describe 'validations' do
      subject { build_stubbed(:course_assessment_answer, workflow_state: workflow_state) }
      let(:workflow_state) { 'attempting' }

      describe '#question' do
        it 'validates that the assessment is consistent' do
          subject.question = build_stubbed(:course_assessment_question)
          expect(subject.question.question_assessments.map(&:assessment)).not_to include(subject.submission.assessment)
          expect(subject.valid?).to be(false)
          expect(subject.errors[:question]).to include(
            I18n.t('activerecord.errors.models.course/assessment/answer.attributes.question'\
              '.consistent_assessment')
          )
        end
      end

      describe '#submission' do
        context 'when the answer is being attempted' do
          it 'validates that the submission is being attempted' do
            subject.submission = create(:submission, workflow_state: 'submitted',
                                                     submitted_at: Time.zone.now)
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

        context 'when the answer is graded' do
          let(:workflow_state) { 'graded' }

          it 'must have a grade' do
            expect(subject).not_to be_valid
            expect(subject.errors[:grade]).not_to be_empty
          end
        end

        context 'when the answer has a grade' do
          let(:answers) do
            ['submitted', 'evaluated', 'graded'].map do |workflow_state|
              build_stubbed(:course_assessment_answer, workflow_state: workflow_state)
            end
          end

          it 'must be less than or equal to the question maximum grade' do
            answers.each do |answer|
              answer.grade = answer.question.maximum_grade + 1
              expect(answer).not_to be_valid
              expect(answer.errors[:grade]).not_to be_empty
            end
          end

          it 'cannot be negative' do
            answers.each do |answer|
              answer.grade = -1
              expect(answer).not_to be_valid
              expect(answer.errors[:grade]).not_to be_empty
            end
          end
        end
      end

      describe '#grader' do
        context 'when the answer is being attempted' do
          it 'cannot have a grader' do
            subject.grader = build(:user)
            expect(subject).not_to be_valid
            expect(subject.errors[:grader]).not_to be_empty
          end
        end

        context 'when the answer is graded' do
          let(:workflow_state) { 'graded' }

          it 'must have a grader' do
            expect(subject).not_to be_valid
            expect(subject.errors[:grader]).not_to be_empty
          end
        end
      end
    end

    describe '#finalise!' do
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

    describe '#unsubmit!' do
      before { subject.finalise! }
      it 'sets grade, grader, graded_at and submitted_at to nil' do
        subject.unsubmit!
        expect(subject.grade).to be_nil
        expect(subject.grader).to be_nil
        expect(subject.graded_at).to be_nil
        expect(subject.submitted_at).to be_nil
      end
    end

    describe '#auto_grade!' do
      let(:course) { create(:course) }
      let(:student_user) { create(:course_student, course: course).user }
      let(:assessment) { create(:assessment, course: course) }
      let(:question) do
        build(:course_assessment_question_multiple_response, assessment: assessment).question
      end
      let(:answer_traits) { :submitted }
      subject do
        create(:course_assessment_answer_multiple_response, *answer_traits,
               question: question, creator: student_user).answer
      end

      it 'creates a new auto_grading' do
        subject.auto_grade!
        expect(subject.auto_grading).to be_persisted
      end

      context 'when the answer has been graded before' do
        let(:answer_traits) { :graded }
        it 'allows re-grading' do
          old_grade = subject.grade
          subject.auto_grade!
          subject.reload

          expect(subject.grade).to eq(old_grade)
        end
      end

      context 'when the answer has not been finalised' do
        let(:answer_traits) { nil }
        it 'fails with an IllegalStateError' do
          expect { subject.auto_grade! }.to raise_error(IllegalStateError)
        end
      end

      context 'when grade inline' do
        before { allow(subject).to receive(:grade_inline?).and_return(true) }

        it 'returns nil' do
          expect(subject.auto_grade!).to be_nil
        end
      end

      context 'when not grade inline' do
        before { allow(subject).to receive(:grade_inline?).and_return(false) }

        it 'returns an ActiveJob' do
          expect(subject.auto_grade!).to be_a(ActiveJob::Base)
        end

        with_active_job_queue_adapter(:test) do
          it 'queues the job' do
            subject
            expect { subject.auto_grade! }.to \
              have_enqueued_job(Course::Assessment::Answer::AutoGradingJob).exactly(:once)
          end
        end
      end
    end

    describe '#ensure_auto_grading!' do
      context 'when an existing auto grading already exists' do
        let(:existing_record) do
          # Duplicate the subject so the subject does not know about the grading.
          create(:course_assessment_answer_auto_grading, answer: subject.class.find(subject.id))
        end

        it 'returns the existing grading' do
          # Simulate a concurrent creation of an existing record.
          expect(subject.auto_grading).to be_nil
          existing_record

          expect(subject.send(:ensure_auto_grading!)).to eq(existing_record)
        end
      end

      context 'when no existing auto grading exists' do
        it 'creates a new grading' do
          expect(subject.send(:ensure_auto_grading!)).to be_persisted
        end
      end
    end

    describe '#reset_answer' do
      subject { answer.reset_answer }

      it "calls the polymorphic object's methods" do
        answer = create(:course_assessment_answer_multiple_response).answer
        expect(answer.specific).to receive(:reset_answer).and_return(nil)
        answer.reset_answer
      end

      context 'when the question does not implement #reset_attempt' do
        let(:answer) { create(:course_assessment_answer) }

        before do
          actable = double
          allow(actable).to receive(:self_respond_to?).and_return(false)
          allow(answer).to receive(:actable).and_return(actable)
        end

        it 'raises a not implemented error' do
          expect { subject }.to raise_error(NotImplementedError)
        end
      end
    end
  end
end
