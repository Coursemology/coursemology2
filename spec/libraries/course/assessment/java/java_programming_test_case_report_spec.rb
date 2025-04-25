# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Java::JavaProgrammingTestCaseReport do
  context 'when given a java programming test case report' do
    let(:report_path) do
      File.join(
        Rails.root,
        'spec/fixtures/course/programming_java_test_report.xml'
      )
    end

    let(:parsed_report) do
      Course::Assessment::Java::JavaProgrammingTestCaseReport.new(File.read(report_path))
    end
    subject { parsed_report }

    describe '#test_suites' do
      it 'returns all the test suites in the report' do
        expect(subject.test_suites.length).to eq(1)
      end
    end

    describe '#test_cases' do
      it 'returns all the test cases in the report' do
        expect(subject.test_cases.length).to eq(4)
      end
    end

    describe Course::Assessment::Java::JavaProgrammingTestCaseReport::TestSuite do
      subject { parsed_report.test_suites.first }

      describe '#name' do
        it 'returns the name attribute' do
          expect(subject.name).to eq('AllTests')
        end
      end

      describe '#identifier' do
        it 'generates an identifier for the test suite' do
          expect(subject.identifier).to eq(subject.name)
        end
      end

      describe '#duration' do
        it 'returns the time attribute' do
          expect(subject.duration).to eq(0.105)
        end
      end

      describe '#test_cases' do
        it 'returns all test cases in the suite' do
          expect(subject.test_cases.length).to eq(4)
        end
      end
    end

    describe Course::Assessment::Java::JavaProgrammingTestCaseReport::TestCase do
      let(:test_cases) { parsed_report.test_suites.first.test_cases }
      let(:test_case) { test_cases.second }
      subject { test_case }

      describe '#name' do
        it 'returns the name attribute' do
          expect(subject.name).to eq('test_public_02')
        end
      end

      describe '#identifier' do
        it 'generates an identifier for the test suite' do
          expect(subject.identifier).to include(subject.test_suite.name)
          expect(subject.identifier).to include(subject.name)
        end
      end

      describe '#duration' do
        it 'returns the time attribute' do
          expect(subject.duration).to eq(0.0)
        end
      end

      context 'when the test case is passing' do
        describe '#expression' do
          it 'returns the expression attribute' do
            expect(subject.expression).to eq('{67, 65, 43, 42, 23, 17, 9, 100}')
          end
        end

        describe '#expected' do
          it 'returns the expected attribute' do
            expect(subject.expected).to eq('100')
          end
        end

        describe '#output' do
          it 'returns the output attribute' do
            expect(subject.output).to eq('100')
          end
        end

        describe '#hint' do
          it 'returns the hint attribute' do
            expect(subject.hint).to eq('A hint')
          end
        end

        describe '#failure_message' do
          it 'returns no failure_message' do
            expect(subject.failure_message).to be_nil
          end
        end

        describe '#status' do
          it 'returns the status attribute' do
            expect(subject.status).to eq('PASS')
            expect(subject.passed?).to be true
            expect(subject.failed?).to be false
            expect(subject.skipped?).to be false
          end
        end

        describe '#messages' do
          it 'returns a hash with the output and hint' do
            expect(subject.messages.keys).to include(:output, :hint)
            expect(subject.messages.keys).to_not include(:error, :failure, :failure_contents)
          end
        end
      end

      context 'when the test case is failing' do
        let(:test_case) { test_cases.first }

        describe '#expression' do
          it 'returns the expression attribute' do
            expect(subject.expression).to eq('{1, 3, 5, 7, 9, 11, 10, 8, 6, 4}')
          end
        end

        describe '#expected' do
          it 'returns the expected attribute' do
            expect(subject.expected).to eq('11')
          end
        end

        describe '#output' do
          it 'returns the output attribute' do
            expect(subject.output).to eq('8')
          end
        end

        describe '#failure_message' do
          it 'returns the failure message' do
            expect(subject.failure_message).to eq('java.lang.AssertionError: expected [11] but found [8]')
          end
        end

        describe '#status' do
          it 'returns the status attribute' do
            expect(subject.status).to eq('FAIL')
            expect(subject.passed?).to be false
            expect(subject.failed?).to be true
            expect(subject.skipped?).to be false
          end
        end

        describe '#messages' do
          it 'returns a hash with the output, hint, failure and failure_contents' do
            expect(subject.messages.keys).to include(:output, :hint, :failure, :failure_contents)
            expect(subject.messages[:failure_contents]).to_not be_empty
          end
        end
      end

      context 'when the test case throws an exception' do
        let(:test_case) { test_cases.third }

        describe '#expression' do
          it 'returns the expression attribute' do
            expect(subject.expression).to eq('{4, -100, -80, 15, 20, 25, 30}')
          end
        end

        describe '#expected' do
          it 'returns the expected attribute' do
            expect(subject.expected).to eq('30')
          end
        end

        describe '#output' do
          it 'returns no output attribute' do
            expect(subject.output).to be_empty
          end
        end

        describe '#failure_message' do
          it 'returns the failure message' do
            expect(subject.failure_message).to eq(
              'org.apache.tools.ant.ExitException: Permission ("java.lang.RuntimePermission" "exitVM") was not granted.'
            )
          end
        end

        describe '#status' do
          it 'returns the status attribute' do
            expect(subject.status).to eq('FAIL')
            expect(subject.passed?).to be false
            expect(subject.failed?).to be true
            expect(subject.skipped?).to be false
          end
        end

        describe '#messages' do
          it 'returns a hash with the failure and failure_contents' do
            expect(subject.messages.keys).to include(:failure, :failure_contents)
            expect(subject.messages[:failure_contents]).to_not be_empty
          end
        end
      end
    end
  end
end
