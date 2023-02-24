# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingEvaluationService do
  describe Course::Assessment::ProgrammingEvaluationService::Result do
    self::TIME_LIMIT_EXCEEDED_EXIT_CODE = 137
    let(:exit_code) { 0 }
    let(:test_reports) { { report: '' } }
    subject do
      Course::Assessment::ProgrammingEvaluationService::Result.new('', '', test_reports, exit_code)
    end

    describe '#error' do
      context 'when the test reports have values' do
        context 'when the exit code is 0' do
          it { is_expected.not_to be_error }
        end

        context 'when the exit code is nonzero' do
          let(:exit_code) { 2 }
          it { is_expected.not_to be_error }
        end
      end

      context 'when the test_reports are an empty hash' do
        let(:test_reports) { {} }
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
        let(:test_reports) { {} }
        it 'returns TimeLimitExceededError' do
          expect(subject).to be_time_limit_exceeded
          expect(subject.exception).to \
            be_a(Course::Assessment::ProgrammingEvaluationService::TimeLimitExceededError)
        end
      end

      context 'when there are all other errors' do
        let(:exit_code) { 2 }
        let(:test_reports) { {} }
        it 'returns Error' do
          expect(subject).to be_error
          expect(subject.exception).to be_a(Course::Assessment::ProgrammingEvaluationService::Error)
        end
      end
    end
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Course::Assessment::ProgrammingEvaluationService }

    it 'returns the result of evaluating' do
      result = subject.execute(Coursemology::Polyglot::Language::Python::Python3Point10.instance, 64,
                               5.seconds, 30.seconds,
                               File.join(Rails.root, 'spec', 'fixtures', 'course',
                                         'programming_question_template.zip'))
      expect(result).to be_a(Course::Assessment::ProgrammingEvaluationService::Result)
    end

    context 'when the evaluation times out' do
      it 'raises a Timeout::Error' do
        expect do
          # Pass in a non-zero timeout as Ruby's Timeout treats 0 as infinite.
          subject.execute(Coursemology::Polyglot::Language::Python::Python3Point10.instance,
                          64, 5.seconds, 30.seconds,
                          File.join(Rails.root, 'spec', 'fixtures', 'course',
                                    'programming_question_template.zip'), 0.1.seconds)
        end.to raise_error(Timeout::Error)
      end
    end

    describe '#create_container' do
      let(:memory_limit) { nil }
      let(:time_limit) { nil }
      let(:service_instance) do
        subject.new(Coursemology::Polyglot::Language::Python::Python3Point10.instance,
                    memory_limit, time_limit, 30.seconds,
                    Rails.root.join('spec', 'fixtures', 'course',
                                    'programming_question_template.zip'), nil)
      end
      let(:image) { 'python:3.10' }
      let(:container) { service_instance.send(:create_container, image) }

      it 'prefixes the image with coursemology/evaluator-image' do
        # when the time_limit of a course is not defined, the default time_limit is set to 30 seconds
        expect(CoursemologyDockerContainer).to \
          receive(:create).with("coursemology/evaluator-image-#{image}",
                                hash_including(argv: ['-c30']))

        container
      end

      context 'when the course has its maximum programming time limit set' do
        let(:service_instance2) do
          subject.new(Coursemology::Polyglot::Language::Python::Python3Point10.instance,
                      nil, nil, 170.seconds,
                      Rails.root.join('spec', 'fixtures', 'course',
                                      'programming_question_template.zip'), nil)
        end
        let(:image2) { 'python:3.10' }
        let(:container2) { service_instance2.send(:create_container, image2) }

        it 'prefixes the image with the correct coursemology/evaluator-image' do
          # when the time_limit of a course is not defined, the default time_limit is set to 30 seconds
          expect(CoursemologyDockerContainer).to \
            receive(:create).with("coursemology/evaluator-image-#{image2}",
                                  hash_including(argv: ['-c170']))

          container2
        end
      end

      context 'when resource limits are specified' do
        let(:memory_limit) { 16 }
        let(:time_limit) { 5 }
        it 'specifies them when creating the container' do
          expect(CoursemologyDockerContainer).to \
            receive(:create).with("coursemology/evaluator-image-#{image}",
                                  hash_including(argv: ['-c5', '-m16384']))

          container
        end
      end
    end
  end
end
