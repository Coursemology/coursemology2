# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingEvaluationService do
  describe Course::Assessment::ProgrammingEvaluationService::Result do
    self::TIME_LIMIT_EXCEEDED_EXIT_CODE = 137
    let(:exit_code) { 0 }
    let(:test_report) { '' }
    subject do
      Course::Assessment::ProgrammingEvaluationService::Result.new('', '', test_report, exit_code)
    end

    describe '#error' do
      context 'when the test report is not nil' do
        context 'when the exit code is 0' do
          it { is_expected.not_to be_error }
        end

        context 'when the exit code is nonzero' do
          let(:exit_code) { 2 }
          it { is_expected.not_to be_error }
        end
      end

      context 'when the test_report is nil' do
        let(:test_report) { nil }
        context 'when the exit code is 0' do
          it { is_expected.not_to be_error }
        end

        context 'when the exit code is nonzero' do
          let(:exit_code) { 2 }
          it { is_expected.to be_error }
        end
      end
    end

    describe '#time_limit_exceeded?' do
      context 'when the process exits normally' do
        it { is_expected.not_to be_time_limit_exceeded }
      end

      context 'when the process exits with a SIGKILL' do
        let(:exit_code) { self.class::TIME_LIMIT_EXCEEDED_EXIT_CODE }
        it { is_expected.to be_time_limit_exceeded }
      end
    end

    describe '#exception' do
      context 'when the result is not errored' do
        it 'returns nil' do
          expect(subject).not_to be_error
          expect(subject.exception).to be_nil
        end
      end

      context 'when the time limit is exceeded' do
        let(:exit_code) { self.class::TIME_LIMIT_EXCEEDED_EXIT_CODE }
        let(:test_report) { nil }
        it 'returns TimeLimitExceededError' do
          expect(subject).to be_time_limit_exceeded
          expect(subject.exception).to \
            be_a(Course::Assessment::ProgrammingEvaluationService::TimeLimitExceededError)
        end
      end

      context 'when there are all other errors' do
        let(:exit_code) { 2 }
        let(:test_report) { nil }
        it 'returns Error' do
          expect(subject).to be_error
          expect(subject.exception).to be_a(Course::Assessment::ProgrammingEvaluationService::Error)
        end
      end
    end
  end

  subject { Course::Assessment::ProgrammingEvaluationService }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    it 'returns the result of evaluating' do
      result = subject.execute(course,
                               Coursemology::Polyglot::Language::Python::Python2Point7.instance, 64,
                               5.seconds, File.join(Rails.root, 'spec', 'fixtures', 'course',
                                                    'programming_question_template.zip'))
      expect(result).to be_a(Course::Assessment::ProgrammingEvaluationService::Result)
    end

    context 'when the evaluation times out' do
      it 'raises a Timeout::Error' do
        expect do
          subject.execute(course, Coursemology::Polyglot::Language::Python::Python2Point7.instance,
                          64, 5.seconds, File.join(Rails.root, 'spec', 'fixtures', 'course',
                                                   'programming_question_template.zip'), 0.seconds)
        end.to raise_error(Timeout::Error)
      end
    end

    describe '#create_evaluation' do
      subject do
        Course::Assessment::ProgrammingEvaluationService.
          new(course, Coursemology::Polyglot::Language::Python::Python2Point7.instance, 64,
              5.seconds, File.join(Rails.root, 'spec', 'fixtures', 'course',
                                   'programming_question_template.zip'), 5.seconds)
      end

      it 'creates the package for the evaluator to download' do
        evaluation = subject.send(:create_evaluation)

        # Remove the leading / because Pathname treats it as an absolute path.
        expect(Rails.public_path + evaluation.package_path[1..-1]).to exist
      end

      it 'successfully creates the evaluation' do
        evaluation = subject.send(:create_evaluation)
        expect(evaluation).to be_persisted
      end
    end
  end
end
