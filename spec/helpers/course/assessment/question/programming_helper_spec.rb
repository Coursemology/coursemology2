# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingHelper do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    def build_error(error_class, message = error_class.name)
      { 'class' => error_class.name, 'message' => message }
    end

    before { helper.instance_variable_set(:@programming_question, programming_question) }
    let(:import_job) { nil }
    let(:programming_question) do
      build(:course_assessment_question_programming).tap do |question|
        question.import_job = import_job
      end
    end

    describe '#import_error_message' do
      subject { helper.send(:import_error_message, build_error(error_class, message)) }
      let(:error_class) { StandardError }
      let(:message) { '' }

      context 'when an InvalidDataError is raised' do
        let(:error_class) { InvalidDataError }
        it 'returns invalid package' do
          expect(subject).to eq(I18n.t('course.assessment.question.programming.form.import_result.'\
                                       'errors.invalid_package'))
        end
      end

      context 'when a TimeLimitExceededError is raised' do
        let(:error_class) do
          Course::Assessment::ProgrammingEvaluationService::TimeLimitExceededError
        end

        it 'returns time limit exceeded' do
          expect(subject).to eq(I18n.t('course.assessment.question.programming.form.import_result.'\
                                       'errors.time_limit_exceeded'))
        end
      end

      context 'when a Timeout::Error is raised' do
        let(:error_class) { Timeout::Error }

        it 'returns timeout error' do
          expect(subject).to eq(I18n.t('course.assessment.question.programming.form.import_result.'\
                                       'errors.evaluation_timeout'))
        end
      end

      context 'when a generic Evaluation error is raised' do
        let(:error_class) { Course::Assessment::ProgrammingEvaluationService::Error }
        it 'returns the generic error message' do
          expect(subject).to eq(I18n.t('course.assessment.question.programming.form.import_result.'\
                                       'errors.evaluation_error'))
        end
      end

      context 'when any other error is raised' do
        let(:message) { 'test' }
        it 'returns the error message' do
          expect(subject).to eq(message)
        end
      end
    end

    describe '#import_errored?' do
      subject { helper.import_errored? }
      context 'when the question does not have an import job' do
        it { is_expected.to be(false) }
      end

      context 'when the import job is successful' do
        let(:import_job) { build(:trackable_job, :completed) }
        it { is_expected.to be(false) }
      end

      context 'when the import job errored' do
        let(:import_job) { build(:trackable_job, :errored, error: build_error(StandardError)) }
        it { is_expected.to be(true) }
      end
    end

    describe '#display_build_log?' do
      let(:import_job) { build(:trackable_job, :errored, error: build_error(error_class)) }
      subject { helper.display_build_log? }

      context 'when the import job errored with an Evaluator Error' do
        let(:error_class) { Course::Assessment::ProgrammingEvaluationService::Error }
        it { is_expected.to be(true) }
      end

      context 'when the import job errored with any other error' do
        let(:error_class) { StandardError }
        it { is_expected.to be(false) }
      end
    end
  end
end
