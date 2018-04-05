# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingTestCaseHelper do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#get_output' do
      let(:test_result) do
        build_stubbed(:course_assessment_answer_programming_auto_grading_test_result,
                      test_result_trait)
      end
      subject { get_output(test_result) }

      context 'when there are no messages' do
        let(:test_result_trait) {}

        it { is_expected.to eq('') }
      end

      context 'when test failed' do
        let(:test_result_trait) { :failed }

        it { is_expected.to eq(test_result.messages['failure']) }
      end

      context 'when test errored' do
        let(:test_result_trait) { :errored }

        it { is_expected.to eq(test_result.messages['error']) }
      end

      context 'when output attribute is set' do
        let(:test_result_trait) { :output }

        it { is_expected.to eq(test_result.messages['output']) }
      end

      context 'when both output and failure messages are present' do
        let(:test_result_trait) { :failed_with_output }

        it { is_expected.to eq(test_result.messages['output']) }
      end
    end
  end
end
