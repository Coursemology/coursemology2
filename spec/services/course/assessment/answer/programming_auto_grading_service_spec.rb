# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingAutoGradingService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    with_active_job_queue_adapter(:test) do
      let(:answer) do
        arguments = *answer_traits
        options = arguments.extract_options!
        options[:question_traits] = question_traits
        options[:submission_traits] = submission_traits
        create(:course_assessment_answer_programming, :submitted, *arguments, options).answer
      end
      let(:question) { answer.question.actable }
      let(:question_traits) do
        [{
          template_package: true,
          test_cases: question_test_cases,
          maximum_grade: 3
        }]
      end
      let(:question_test_cases) do
        report = File.read(question_test_report_path)
        Course::Assessment::ProgrammingTestCaseReport.new(report).test_cases.map do |test_case|
          Course::Assessment::Question::ProgrammingTestCase.new(identifier: test_case.identifier,
                                                                test_case_type: :private_test)
        end
      end
      let(:question_test_report_path) do
        File.join(Rails.root, 'spec/fixtures/course/programming_single_test_suite_report.xml')
      end
      let(:submission_traits) { [{ auto_grade: false }] }
      let(:answer_traits) { [{ file_count: 1 }] }
      let!(:grading) { create(:course_assessment_answer_auto_grading, answer: answer) }

      context 'with a test report' do
        before do
          allow(Course::Assessment::ProgrammingEvaluationService).to \
            receive(:execute).and_wrap_original do |original, *args|
              result = original.call(*args)
              result.test_reports = { public: File.read(question_test_report_path) }
              result
            end
        end

        describe '#grade' do
          subject { super().grade(answer) }
          let(:answer_contents) { 'test code ' + SecureRandom.hex }
          let(:answer_traits) { [{ file_contents: [answer_contents] }] }
          before { allow(answer.submission.assessment).to receive(:autograded?).and_return(true) }

          it 'creates a new package with the correct file contents' do
            expect(Course::Assessment::ProgrammingEvaluationService).to \
              receive(:execute).and_wrap_original do |method, *args|
              package = Course::Assessment::ProgrammingPackage.new(args[3])
              expect(package.submission_files.values).to contain_exactly(answer_contents)
              method.call(*args)
            end
            subject
          end

          it 'creates a Programming Auto Grading record' do
            subject
            expect(grading.actable).to be_a(Course::Assessment::Answer::ProgrammingAutoGrading)
          end

          context 'when the answer is correct' do
            let(:question_test_report_path) do
              File.join(Rails.root,
                        'spec/fixtures/course/programming_single_test_suite_report_pass.xml')
            end

            it 'marks the answer correct' do
              subject
              expect(answer).to be_correct
              expect(answer.grade).to eq(question.maximum_grade)
            end

            context 'when results are saved' do
              before { subject.save! }

              it 'saves the specific auto_grading' do
                auto_grading = answer.reload.auto_grading.actable

                expect(auto_grading).to be_present
                expect(auto_grading.test_results).to be_present
              end
            end
          end

          context 'when the answer is wrong' do
            it 'marks the answer wrong' do
              subject
              expect(answer).not_to be_correct
            end

            it 'gives a grade proportional to the number of test cases' do
              subject
              test_case_count = answer.question.actable.test_cases.count
              expect(answer.grade).to eq(answer.question.maximum_grade / test_case_count)
            end
          end

          context 'when there is an error' do
            let(:question_test_report_path) do
              File.join(Rails.root,
                        'spec/fixtures/course/programming_single_test_suite_report.xml')
            end

            it 'sets the error message' do
              subject
              # Exact error is from the fixture
              expect(answer.auto_grading.actable.test_results[0].messages['error']).
                to eq('TypeError: mosaic() takes 1 positional argument but 4 were given')
            end
          end

          context 'when an autograded assessment has evaluation tests' do
            let(:question_test_cases) do
              report = File.read(question_test_report_path)
              Course::Assessment::ProgrammingTestCaseReport.new(report).test_cases.map do |t|
                Course::Assessment::Question::ProgrammingTestCase.new(
                  identifier: t.identifier, test_case_type: :evaluation_test
                )
              end
            end

            before do
              allow(answer.submission.assessment).to receive(:autograded?).and_return(true)
            end

            it 'ignores the evaluation tests and marks the answer correct' do
              subject
              expect(answer).to be_correct
              expect(answer.grade).to eq(question.maximum_grade)
            end
          end
        end
      end

      context 'without a test report' do
        before do
          allow(Course::Assessment::ProgrammingEvaluationService).to \
            receive(:execute).and_wrap_original do |original, *args|
              result = original.call(*args)
              result.test_reports = {}
              result.stdout = "Makefile:6: recipe for target 'test' failed"
              result.stderr = "ImportError: No module named 'simulation'"
              result.exit_code = 2
              result
            end
        end

        describe '#grade' do
          before { allow(answer.submission.assessment).to receive(:autograded?).and_return(true) }

          subject { super().grade(answer) }

          it 'sets grade to 0' do
            subject
            expect(answer.grade).to eq 0
          end

          it 'marks the answer wrong' do
            subject
            expect(answer).not_to be_correct
          end

          it 'sets each test result as failed' do
            subject
            answer.auto_grading.specific.test_results.each do |test_result|
              expect(test_result).not_to be_passed
            end
          end

          it 'sets the message for each test result' do
            subject
            answer.auto_grading.specific.test_results.each do |test_result|
              expect(test_result.messages['error']).
                to eq 'course.assessment.answer.programming_auto_grading.grade.evaluation_failed'
            end
          end

          it 'sets stdout, stderr and exit code for the programming autograding object' do
            subject
            expect(answer.auto_grading.specific.stdout).
              to eq "Makefile:6: recipe for target 'test' failed"
            expect(answer.auto_grading.specific.stderr).
              to eq "ImportError: No module named 'simulation'"
            expect(answer.auto_grading.specific.exit_code).to eq 2
          end
        end
      end
    end
  end
end
