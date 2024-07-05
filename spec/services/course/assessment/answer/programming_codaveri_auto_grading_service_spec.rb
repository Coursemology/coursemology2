# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingCodaveriAutoGradingService do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    with_active_job_queue_adapter(:test) do
      let!(:course) { create(:course) }
      let!(:assessment) { create(:assessment, course: course) }
      let!(:submission) { create(:submission, auto_grade: false, assessment: assessment, creator: course.creator) }
      let(:question) do
        create(:course_assessment_question_programming,
               assessment: assessment,
               package_type: :zip_upload,
               imported_attachment: attachment,
               test_cases: question_test_cases,
               maximum_grade: 7,
               with_codaveri_question: true)
      end
      let(:question_test_cases) do
        public_report = File.read(question_test_public_report_path)
        public_test_cases = Course::Assessment::ProgrammingTestCaseReport.
                            new(public_report).test_cases.map do |test_case|
          Course::Assessment::Question::ProgrammingTestCase.new(identifier: test_case.identifier,
                                                                test_case_type: :public_test)
        end

        private_report = File.read(question_test_private_report_path)
        private_test_cases = Course::Assessment::ProgrammingTestCaseReport.
                             new(private_report).test_cases.map do |test_case|
          Course::Assessment::Question::ProgrammingTestCase.new(identifier: test_case.identifier,
                                                                test_case_type: :public_test)
        end
        (public_test_cases << private_test_cases).flatten!
      end
      let(:question_test_private_report_path) do
        File.join(Rails.root, 'spec/fixtures/course/programming_private_test_report.xml')
      end
      let(:question_test_public_report_path) do
        File.join(Rails.root, 'spec/fixtures/course/programming_public_test_report.xml')
      end

      let(:package_path) do
        File.join(Rails.root, 'spec/fixtures/course/programming_question_template_codaveri.zip')
      end
      let(:attachment) { create(:attachment_reference, binary: true, file_path: package_path) }

      let!(:answer) do
        create(:course_assessment_answer_programming, :submitted, current_answer: true,
                                                                  question: question.acting_as,
                                                                  submission: submission,
                                                                  file_name_contents: [['template.py',
                                                                                        answer_contents]]).answer
      end
      # rubocop:disable Layout/LineLength
      let(:answer_contents) do
        "def to_rna(tagged_data):\r\n    tag_type = get_tag_type(tagged_data)\r\n    data     = get_data(tagged_data)\r\n    op       = get_op(\"to_rna\", (tag_type,))\r\n    return tag(\"rna\", op(data))\r\n\r\ndef is_same_dogma(tagged_data1, tagged_data2):\r\n    tag_type1 = get_tag_type(tagged_data1)\r\n    tag_type2 = get_tag_type(tagged_data2)\r\n    op        = get_op(\"is_same_dogma\", (tag_type1, tag_type2))\r\n    data1     = get_data(tagged_data1)\r\n    data2     = get_data(tagged_data2)\r\n    return op(data1, data2)\r\n"
      end
      # rubocop:enable Layout/LineLength

      let!(:grading) { create(:course_assessment_answer_auto_grading, answer: answer) }

      describe '#grade and succeeded immediately' do
        subject { super().grade(answer) }

        before do
          allow(answer.submission.assessment).to receive(:autograded?).and_return(true)
          Excon.defaults[:mock] = true
          Excon.stub({ method: 'POST' }, Codaveri::EvaluateApiStubs.evaluate_success_final_result)
        end
        after do
          Excon.stubs.clear
        end

        it 'creates a new package with the correct file contents' do
          expect(Course::Assessment::ProgrammingCodaveriEvaluationService).to \
            receive(:execute).and_wrap_original do |method, *args|
            method.call(*args)
          end
          subject
        end

        it 'creates a Programming Auto Grading record' do
          subject
          expect(grading.actable).to be_a(Course::Assessment::Answer::ProgrammingAutoGrading)
        end

        context 'when the answer is correct' do
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
      end

      describe '#grade and succeeded after polling' do
        subject { super().grade(answer) }

        # dummy URL
        let!(:connection) { Excon.new('http://localhost:53896') }

        before do
          allow(answer.submission.assessment).to receive(:autograded?).and_return(true)

          allow(Excon).to receive(:new).and_return(connection)
          allow(connection).to receive(:post).and_call_original

          Excon.defaults[:mock] = true
          Excon.stub({ method: 'POST' }, Codaveri::EvaluateApiStubs::EVALUATE_ID_CREATED)
          Excon.stub({ method: 'GET' }, Codaveri::EvaluateApiStubs.evaluate_success_final_result)
          Excon.stub({ method: 'GET' }, Codaveri::EvaluateApiStubs::EVALUATE_RESULTS_PENDING)
          Excon.stub({ method: 'GET' }, Codaveri::EvaluateApiStubs::EVALUATE_RESULTS_PENDING)
          Excon.stub({ method: 'GET' }, Codaveri::EvaluateApiStubs::EVALUATE_RESULTS_PENDING)
          allow(connection).to receive(:get).and_wrap_original do |method, *args|
            # After each time connection.get is called, we remove 1 stub from the above list (LIFO)
            # so api will be polled a total of 4 times
            response = method.call(*args)
            Excon.unstub({ method: 'GET' })
            response
          end

          stub_const('Course::Assessment::ProgrammingCodaveriEvaluationService::POLL_INTERVAL_SECONDS', 0.001)
        end
        after do
          Excon.stubs.clear
        end

        it 'polls as long as results still pending' do
          expect(connection).to receive(:get).exactly(4).times
          subject
        end

        context 'when the answer is correct' do
          it 'marks the answer correct' do
            subject
            expect(answer).to be_correct
            expect(answer.grade).to eq(question.maximum_grade)
          end
        end
      end

      describe '#when the evaluation times out' do
        subject { super().grade(answer) }

        # dummy URL
        let!(:connection) { Excon.new('http://localhost:53896') }

        before do
          allow(answer.submission.assessment).to receive(:autograded?).and_return(true)

          allow(Excon).to receive(:new).and_return(connection)
          Excon.stub({ method: 'POST' }, Codaveri::EvaluateApiStubs::EVALUATE_ID_CREATED)
          Excon.stub({ method: 'GET' }, Codaveri::EvaluateApiStubs::EVALUATE_RESULTS_PENDING)

          # Pass in a non-zero timeout as Ruby's Timeout treats 0 as infinite.
          stub_const(
            'Course::Assessment::ProgrammingCodaveriEvaluationService::DEFAULT_TIMEOUT',
            0.0000000000001.seconds
          )
        end
        after do
          Excon.stubs.clear
        end
        it 'raises a Timeout::Error' do
          expect { subject }.to raise_error(Timeout::Error)
        end
      end

      describe '#grade but failed immediately' do
        subject { super().grade(answer) }

        before do
          allow(answer.submission.assessment).to receive(:autograded?).and_return(true)
          Excon.defaults[:mock] = true
          Excon.stub({ method: 'POST' }, Codaveri::EvaluateApiStubs.evaluate_failure_final_result)
        end
        after do
          Excon.stubs.clear
        end

        context 'when the API call fails' do
          it 'raises a CodaveriError' do
            expect { subject }.to raise_error(CodaveriError)
            expect(answer.grade).to eq(nil)
            expect(answer.correct).to eq(nil)
            expect(answer.graded_at).to eq(nil)
            expect(answer.actable.auto_grading.actable).to eq(nil)
          end
        end
      end

      describe '#grade and failed after polling' do
        subject { super().grade(answer) }

        let!(:connection) { Excon.new('http://localhost:53896') }

        before do
          allow(answer.submission.assessment).to receive(:autograded?).and_return(true)

          allow(Excon).to receive(:new).and_return(connection)
          allow(connection).to receive(:post).and_call_original

          Excon.defaults[:mock] = true
          Excon.stub({ method: 'POST' }, Codaveri::EvaluateApiStubs::EVALUATE_ID_CREATED)
          Excon.stub({ method: 'GET' }, Codaveri::EvaluateApiStubs.evaluate_failure_final_result)
          Excon.stub({ method: 'GET' }, Codaveri::EvaluateApiStubs::EVALUATE_RESULTS_PENDING)
          allow(connection).to receive(:get).and_wrap_original do |method, *args|
            response = method.call(*args)
            Excon.unstub({ method: 'GET' })
            response
          end

          stub_const('Course::Assessment::ProgrammingCodaveriEvaluationService::POLL_INTERVAL_SECONDS', 0.01)
        end
        after do
          Excon.stubs.clear
        end

        it 'polls as long as results still pending, then throw error' do
          expect(connection).to receive(:get).exactly(2).times
          expect { subject }.to raise_error(CodaveriError)
        end
      end

      describe '#grade but wrong' do
        subject { super().grade(answer) }

        before do
          allow(answer.submission.assessment).to receive(:autograded?).and_return(true)
          Excon.defaults[:mock] = true
          Excon.stub({ method: 'POST' }, Codaveri::EvaluateApiStubs.evaluate_wrong_answer_final_result)
        end
        after do
          Excon.stubs.clear
        end

        context 'when the answer is wrong' do
          it 'marks the answer wrong' do
            subject
            expect(answer).not_to be_correct
          end

          it 'gives a grade proportional to the number of test cases' do
            subject
            test_case_count = answer.question.actable.test_cases.count

            # 6/7 of of the test cases pass according to stubbed_programming_codaveri.rb
            expect(answer.grade).to eq(6 * answer.question.maximum_grade / test_case_count)
          end
        end
      end
    end
  end
end
