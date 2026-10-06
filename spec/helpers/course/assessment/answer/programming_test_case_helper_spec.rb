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

    describe '#get_test_results_by_type' do
      let(:question) { create(:course_assessment_question_programming) }
      let!(:public_case) do
        create(:course_assessment_question_programming_test_case, question: question)
      end
      let!(:private_case) do
        create(:course_assessment_question_programming_test_case, :private, question: question)
      end
      let(:auto_grading) { create(:course_assessment_answer_programming_auto_grading) }
      let(:test_cases_by_type) { question.reload.test_cases_by_type }

      subject { get_test_results_by_type(test_cases_by_type, auto_grading) }

      context 'when the answer has not been graded' do
        subject { get_test_results_by_type(test_cases_by_type, nil) }

        it 'returns an empty result set for every type' do
          expect(subject['public_test']).to eq({})
          expect(subject['private_test']).to eq({})
        end
      end

      context 'when every test case has a result' do
        let!(:public_result) do
          create(:course_assessment_answer_programming_auto_grading_test_result,
                 auto_grading: auto_grading, test_case: public_case)
        end
        let!(:private_result) do
          create(:course_assessment_answer_programming_auto_grading_test_result, :failed,
                 auto_grading: auto_grading, test_case: private_case)
        end

        it 'keys each result by the id of the test case it is for' do
          expect(subject['public_test']).to eq(public_case.id => public_result)
          expect(subject['private_test']).to eq(private_case.id => private_result)
        end
      end

      context 'when a test case was added to the question after the grading run' do
        let!(:public_result) do
          create(:course_assessment_answer_programming_auto_grading_test_result,
                 auto_grading: auto_grading, test_case: public_case)
        end

        it 'omits the test case without failing' do
          expect(subject['public_test']).to eq(public_case.id => public_result)
          expect(subject['private_test']).to eq({})
        end
      end
    end

    describe '#get_first_failure_by_type' do
      let(:question) { create(:course_assessment_question_programming) }
      let!(:first_case) do
        create(:course_assessment_question_programming_test_case,
               question: question, identifier: 'a_first')
      end
      let!(:second_case) do
        create(:course_assessment_question_programming_test_case,
               question: question, identifier: 'b_second')
      end
      let(:auto_grading) { create(:course_assessment_answer_programming_auto_grading) }
      let(:test_cases_by_type) { question.reload.test_cases_by_type }
      let(:test_results_by_type) { get_test_results_by_type(test_cases_by_type, auto_grading) }

      subject { get_first_failure_by_type(test_cases_by_type, test_results_by_type) }

      context 'when every test case passed' do
        before do
          [first_case, second_case].each do |test_case|
            create(:course_assessment_answer_programming_auto_grading_test_result,
                   auto_grading: auto_grading, test_case: test_case)
          end
        end

        it { expect(subject['public_test']).to be_nil }
      end

      context 'when a later test case failed' do
        let!(:failure) do
          create(:course_assessment_answer_programming_auto_grading_test_result, :failed,
                 auto_grading: auto_grading, test_case: second_case)
        end

        before do
          create(:course_assessment_answer_programming_auto_grading_test_result,
                 auto_grading: auto_grading, test_case: first_case)
        end

        it 'returns that test case paired with its result' do
          expect(subject['public_test']).to eq([second_case, failure])
        end
      end

      context 'when a test case has no result' do
        before do
          create(:course_assessment_answer_programming_auto_grading_test_result,
                 auto_grading: auto_grading, test_case: first_case)
        end

        it 'does not treat the unrun test case as a failure' do
          expect(subject['public_test']).to be_nil
        end
      end
    end

    describe '#graded_question_version and #graded_on_previous_version?' do
      let(:question) { create(:course_assessment_question_programming, template_package: true, test_case_count: 2) }
      let(:auto_grading) { create(:course_assessment_answer_programming_auto_grading) }
      let(:new_package) do
        path = File.join(Rails.root, 'spec/fixtures/course/programming_question_template_with_add_files.zip')
        create(:attachment_reference, binary: true, file_path: path)
      end

      def grade_against_live_test_cases
        question.test_cases.each do |test_case|
          create(:course_assessment_answer_programming_auto_grading_test_result,
                 auto_grading: auto_grading, test_case: test_case)
        end
      end

      def edit_question
        Course::Assessment::Question::ProgrammingImportService.import(question, new_package)
        question.reload
      end

      context 'when the answer has not been graded' do
        it 'is the live question' do
          expect(graded_question_version(question, nil)).to eq(question)
          expect(graded_on_previous_version?(question, nil)).to be(false)
        end
      end

      context 'when the run was graded against the live question' do
        before { grade_against_live_test_cases }

        it 'is the live question' do
          expect(graded_question_version(question, auto_grading)).to eq(question)
          expect(graded_on_previous_version?(question, auto_grading)).to be(false)
        end
      end

      context 'when the question has been edited since the run' do
        before do
          grade_against_live_test_cases
          edit_question
        end

        it 'is the snapshot holding the test cases the run was graded against' do
          version = graded_question_version(question, auto_grading)

          expect(version).to eq(question.snapshots.sole)
          expect(version.test_cases.map(&:id)).to match_array(auto_grading.test_results.map(&:test_case_id))
          expect(graded_on_previous_version?(question, auto_grading)).to be(true)
        end
      end

      # Before snapshots were kept, an edit destroyed the run's results along with the test cases.
      context 'when the run no longer has results to say which version it was graded against' do
        it 'is the live question, but still a previous version' do
          expect(graded_question_version(question, auto_grading)).to eq(question)
          expect(graded_on_previous_version?(question, auto_grading)).to be(true)
        end
      end
    end
  end
end
