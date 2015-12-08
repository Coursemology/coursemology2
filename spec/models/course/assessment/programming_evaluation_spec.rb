require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingEvaluation do
  it { is_expected.to belong_to(:course) }
  it { is_expected.to belong_to(:language) }
  it { is_expected.to belong_to(:evaluator) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:evaluation_traits) { nil }
    let(:course) { create(:course) }
    subject { build_stubbed(:course_assessment_programming_evaluation, *evaluation_traits) }

    describe 'validations' do
      context 'when the evaluation has been assigned' do
        let(:evaluation_traits) { :assigned }
        describe '#evaluator' do
          it 'requires the presence of evaluator' do
            subject.evaluator = nil
            expect(subject).not_to be_valid
            expect(subject.errors[:evaluator]).not_to be_nil
          end
        end

        describe '#assigned_at' do
          it 'requires the presence of assigned_at' do
            subject.assigned_at = nil
            expect(subject).not_to be_valid
            expect(subject.errors[:assigned_at]).not_to be_nil
          end
        end
      end

      context 'when the evaluation has been executed' do
        let(:evaluation_traits) { :completed }
        describe '#stdout' do
          it 'requires the presence of stdout' do
            subject.stdout = nil
            expect(subject).not_to be_valid
            expect(subject.errors[:stdout]).not_to be_nil
          end
        end

        describe '#stderr' do
          it 'requires the presence of stderr' do
            subject.stderr = nil
            expect(subject).not_to be_valid
            expect(subject.errors[:stderr]).not_to be_nil
          end
        end

        describe '#test_report' do
          it 'requires the presence of test_report' do
            subject.test_report = nil
            expect(subject).not_to be_valid
            expect(subject.errors[:test_report]).not_to be_nil
          end
        end
      end
    end

    describe '.with_language' do
      subject do
        Course::Assessment::ProgrammingEvaluation.with_language([language]).
          where(course: course)
      end
      let(:language) { Polyglot::Language::Python::Python2Point7.instance.name }
      let!(:expected) do
        create(:course_assessment_programming_evaluation,
               course: course,
               language: Polyglot::Language::Python::Python2Point7.instance)
      end
      let!(:other) do
        create(:course_assessment_programming_evaluation,
               course: course,
               language: Polyglot::Language::Python::Python3Point4.instance)
      end

      it 'returns only those with the specified language' do
        expect(subject).not_to be_empty
        expect(subject).to contain_exactly(expected)
      end
    end

    describe '.pending' do
      subject { Course::Assessment::ProgrammingEvaluation.pending.where(course: course) }
      let!(:pending_jobs) do
        [
          create(:course_assessment_programming_evaluation, course: course),
          create(:course_assessment_programming_evaluation, :assigned,
                 course: course,
                 assigned_at: Time.zone.now - Course::Assessment::ProgrammingEvaluation::TIMEOUT)
        ]
      end
      let!(:running_jobs) do
        create(:course_assessment_programming_evaluation, :assigned, course: course)
      end
      let!(:completed_jobs) do
        [
          create(:course_assessment_programming_evaluation, :completed, course: course),
          create(:course_assessment_programming_evaluation, :errored, course: course)
        ]
      end

      it 'only returns submitted and timed-out assigned jobs' do
        expect(subject).to contain_exactly(*pending_jobs)
      end
    end

    describe '.finished' do
      subject { Course::Assessment::ProgrammingEvaluation.finished.where(course: course) }
      let!(:finished_jobs) do
        [
          create(:course_assessment_programming_evaluation, :completed, course: course),
          create(:course_assessment_programming_evaluation, :errored, course: course)
        ]
      end
      let!(:unfinished_jobs) do
        [
          create(:course_assessment_programming_evaluation, :assigned, course: course),
          create(:course_assessment_programming_evaluation, course: course)
        ]
      end

      it 'returns only completed and errored evaluations' do
        expect(subject).to contain_exactly(*finished_jobs)
      end
    end

    describe '#finished?' do
      context 'when the job errored' do
        let(:evaluation_traits) { :errored }
        it 'returns true' do
          expect(subject).to be_finished
        end
      end

      context 'when the job completed' do
        let(:evaluation_traits) { :completed }
        it 'returns true' do
          expect(subject).to be_finished
        end
      end
    end

    describe '#assign!' do
      subject { super().tap { |subject| subject.assign!(user) } }
      let(:user) { build_stubbed(:user) }

      it 'sets the evaluator to the specified user' do
        expect(subject).to be_assigned
        expect(subject.evaluator).to eq(user)
      end

      it 'sets the evaluator to the specified user' do
        time = Time.zone.now
        expect(subject.assigned_at).to be > time
      end
    end
  end
end
