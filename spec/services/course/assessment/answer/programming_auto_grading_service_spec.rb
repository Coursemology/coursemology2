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

      before do
        Course::Assessment::ProgrammingEvaluationService.class_eval do
          prepend Course::Assessment::StubbedProgrammingEvaluationService
        end
      end

      context 'with a test report' do
        before do
          allow(Course::Assessment::ProgrammingEvaluationService).to \
            receive(:execute).and_wrap_original do |original, *args|
              result = original.call(*args)
              result.test_reports = { public: File.read(question_test_report_path) }
              result
            end
        end

        # An edit can re-import the question while one of its answers is being graded. The run evaluated the
        # package it started with, so its results belong to that version's test cases -- which, once the import
        # commits, have moved to a snapshot. The import here rebuilds test cases with the same identifiers, as an
        # edit that keeps its test names would.
        context 'when the question is re-imported while the answer is being graded' do
          let(:new_package) do
            path = File.join(Rails.root, 'spec/fixtures/course/programming_question_template_with_add_files.zip')
            create(:attachment_reference, binary: true, file_path: path)
          end
          let!(:graded_version_test_case_ids) { question.test_cases.map(&:id) }
          # Loaded afresh, as a grading job deserializes them: nothing on these instances is loaded yet.
          let(:job_answer) { Course::Assessment::Answer.find(answer.id) }
          let(:job_grading) { Course::Assessment::Answer::AutoGrading.find(grading.id) }
          subject { Course::Assessment::Answer::AutoGradingService.grade(job_answer, job_grading) }

          def reimport_question
            Course::Assessment::Question::ProgrammingImportService.
              import(Course::Assessment::Question::Programming.find(question.id), new_package)
          end

          def expect_results_on_the_graded_version
            snapshot = question.reload.snapshots.sole
            expect(snapshot.test_cases.map(&:id)).to match_array(graded_version_test_case_ids)
            expect(grading.reload.actable.test_results.map(&:test_case_id)).
              to match_array(graded_version_test_case_ids)
          end

          context 'when the import commits while the package is being evaluated' do
            before do
              reimported = false
              allow(Course::Assessment::ProgrammingEvaluationService).to \
                receive(:execute).and_wrap_original do |original, *args|
                  result = original.call(*args)
                  result.test_reports = { public: File.read(question_test_report_path) }
                  # The first evaluation is the grading run's; the import evaluates its package too.
                  unless reimported
                    reimported = true
                    reimport_question
                  end
                  result
                end
            end

            it 'matches the results to the test cases of the version it evaluated' do
              subject
              expect_results_on_the_graded_version
            end
          end

          # The narrowest window: between reading the test cases and reading the package. The import runs on its own
          # connection, as a concurrent import job would.
          context 'when the import commits after the test cases are read, before the package is' do
            let(:opened_package_ids) { [] }
            let!(:graded_version_package_id) { question.attachment.attachment_id }

            # The run reads the package's reference right after the test cases, so the import is committed as that
            # read starts.
            def commit_import_once_test_cases_are_read
              grading_thread = Thread.current
              committed = false
              # Resolved here: the import thread cannot evaluate a `let` while the grading thread is inside `subject`.
              question_id = question.id
              package = new_package
              allow_any_instance_of(Course::Assessment::Question::Programming).
                to receive(:attachment_references).and_wrap_original do |original, *args|
                if Thread.current == grading_thread && !committed
                  committed = true
                  import = Thread.new do
                    ActiveRecord::Base.connection_pool.with_connection do
                      ActsAsTenant.without_tenant do
                        Course::Assessment::Question::ProgrammingImportService.
                          import(Course::Assessment::Question::Programming.find(question_id), package)
                      end
                    end
                  end
                  # The import thread may need to autoload while this thread waits for it.
                  ActiveSupport::Dependencies.interlock.permit_concurrent_loads { import.join }
                end
                original.call(*args)
              end
              yield
            end

            before do
              opened = opened_package_ids
              grading_thread = Thread.current
              allow_any_instance_of(AttachmentReference).
                to receive(:open).and_wrap_original do |original, *args, &block|
                opened << original.receiver.attachment_id if Thread.current == grading_thread
                original.call(*args, &block)
              end
            end

            it 'evaluates the package of the version whose test cases it read' do
              commit_import_once_test_cases_are_read { subject }

              expect(question.reload.attachment.attachment_id).not_to eq(graded_version_package_id)
              expect(opened_package_ids).to eq([graded_version_package_id])
              expect_results_on_the_graded_version
            end
          end

          context 'when the import commits after the results are built, before they are saved' do
            before do
              allow(job_answer).to receive(:save!).and_wrap_original do |original, *args|
                reimport_question
                original.call(*args)
              end
            end

            it 'saves the results against the test cases of the version it evaluated' do
              expect { subject }.not_to raise_error
              expect_results_on_the_graded_version
            end
          end
        end

        describe '#grade' do
          subject { super().grade(answer, answer.auto_grading) }
          let(:answer_contents) { "test code #{SecureRandom.hex}" }
          let(:answer_traits) { [{ file_contents: [answer_contents] }] }
          before { allow(answer.submission.assessment).to receive(:autograded?).and_return(true) }

          it 'creates a new package with the correct file contents' do
            expect(Course::Assessment::ProgrammingEvaluationService).to \
              receive(:execute).and_wrap_original do |method, *args|
              package = Course::Assessment::ProgrammingPackage.new(args[4])
              expect(package.submission_files.values).to contain_exactly(answer_contents)
              method.call(*args)
            end
            subject
          end

          it 'creates a Programming Auto Grading record' do
            subject
            expect(grading.actable).to be_a(Course::Assessment::Answer::ProgrammingAutoGrading)
          end

          # A grading job deserializes the answer and its auto grading as separate instances, so nothing
          # links the auto grading being written to the one `answer.auto_grading` would autosave.
          context 'when the answer and auto grading are loaded separately, as in a grading job' do
            subject do
              Course::Assessment::Answer::AutoGradingService.grade(
                Course::Assessment::Answer.find(answer.id),
                Course::Assessment::Answer::AutoGrading.find(grading.id)
              )
            end

            it 'saves the programming auto grading and its test results' do
              subject
              programming_auto_grading = grading.reload.actable

              expect(programming_auto_grading).to be_a(Course::Assessment::Answer::ProgrammingAutoGrading)
              expect(programming_auto_grading).to be_persisted
              expect(programming_auto_grading.test_results).to be_present
            end
          end

          # Answer#auto_grade! grades a programming answer into a new run each time.
          context 'when the answer is graded again, into a new run' do
            def grade_into(run)
              Course::Assessment::Answer::AutoGradingService.grade(Course::Assessment::Answer.find(answer.id), run)
            end

            it 'keeps the earlier run and its results attached to the answer' do
              grade_into(grading)
              later_run = answer.auto_gradings.create!
              grade_into(later_run)

              runs = answer.reload.auto_gradings
              expect(runs).to eq([grading, later_run])
              expect(runs.map { |run| run.reload.actable.test_results }).to all(be_present)
              expect(answer.auto_grading).to eq(later_run)
            end
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
              # 2/3 of of the test cases pass according to programming_single_test_suite_report.xml
              expect(answer.grade).to eq(2 * answer.question.maximum_grade / test_case_count)
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

          context "when answer fails autograded assessment's evaluation tests" do
            let(:question_test_report_path) do
              Rails.root.join('spec', 'fixtures', 'course', 'programming_single_test_suite_report.xml')
            end
            let(:question_test_cases) do
              # One test case per test in the report, the first being an evaluation test.
              report = File.read(question_test_report_path)
              test_case_types = ['evaluation_test', 'private_test', 'public_test']
              Course::Assessment::ProgrammingTestCaseReport.new(report).test_cases.
                each_with_index.map do |test_case, index|
                Course::Assessment::Question::ProgrammingTestCase.new(identifier: test_case.identifier,
                                                                      test_case_type: test_case_types[index])
              end
            end

            before { allow(answer.submission.assessment).to receive(:autograded?).and_return(true) }

            it 'ignores the evaluation tests and marks the answer correct' do
              subject
              expect(answer).to be_correct
              expect(answer.grade).to eq(question.maximum_grade)
            end

            context 'when autograded assessment uses evaluation test for grade/exp assignment' do
              before do
                answer.submission.assessment.use_evaluation = true
                subject.save!
              end

              it 'deducts grade for the failed evaluation test cases' do
                Course::Assessment::Answer::AutoGradingService.grade(answer, answer.auto_grading)
                expect(answer.grade).to be < question.maximum_grade
              end
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

          subject { super().grade(answer, answer.auto_grading) }

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
                to eq I18n.t(
                  'errors.course.assessment.answer.programming_auto_grading.grade.evaluation_failed_syntax'
                )
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
