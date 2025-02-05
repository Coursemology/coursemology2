# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingCodaveriEvaluationService do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
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
      "def to_rna(tagged_data):\r\n    tag_type = get_tag_type(tagged_data)\r\n    data     = get_data(tagged_data)\r\n    op       = get_op(\"to_rna\", (tag_type,))\r\n    return tag(\"rna\", op(data))\r\n\r\ndef is_same_dogma(tagged_data1, tagged_data2):\r\n    tag_type1 = get_tag_type(tagged_data1)\r\n    tag_type2 = get_tag_type(tagged_data2)\r\n    op        = get_op(\"is_same_dogma\", (tag_type1, tag_type2))\r\n    data1     = get_data(tagged_data1)\r\n    data2     = get_data(tagged_data2)\r\n    return op(data1, data2)"
    end
    # rubocop:enable Layout/LineLength

    subject { Course::Assessment::ProgrammingCodaveriEvaluationService }

    describe '#execute success' do
      before do
        Excon.defaults[:mock] = true
        Excon.stub({ method: 'POST' }, Codaveri::EvaluateApiStubs.evaluate_success_final_result)
      end
      after do
        Excon.stubs.clear
      end
      it 'returns the result of evaluating' do
        result = subject.execute(course, question, answer.actable)
        expect(result).to be_a(Course::Assessment::ProgrammingCodaveriEvaluationService::Result)

        codaveri_evaluation_results = result[2]
        expect(codaveri_evaluation_results[0][:success]).to eq(1)
        expect(codaveri_evaluation_results[0][:output]).to eq("'GCAUUU'\\n")
        expect(codaveri_evaluation_results[0][:stdout]).to eq("'GCAUUU'\\n")
        expect(codaveri_evaluation_results[2][:success]).to eq(1)
        expect(codaveri_evaluation_results[2][:output]).to eq('True\\n')
        expect(codaveri_evaluation_results[2][:stdout]).to eq('True\\n')
      end
    end

    describe '#execute with error statuses' do
      before do
        Excon.defaults[:mock] = true
        Excon.stub({ method: 'POST' }, Codaveri::EvaluateApiStubs.evaluate_error_status_final_result)
      end
      after do
        Excon.stubs.clear
      end
      it 'returns the result of evaluating' do
        result = subject.execute(course, question, answer.actable)
        expect(result).to be_a(Course::Assessment::ProgrammingCodaveriEvaluationService::Result)

        codaveri_evaluation_results = result[2]

        codaveri_evaluation_results.each do |test_case_result|
          expect(test_case_result[:success]).to eq(0)
          expect(test_case_result[:output]).to be_empty
          expect(test_case_result[:stderr]).to eq('Error')
          expect(test_case_result[:error]).to_not be_empty
        end
      end
    end

    describe '#execute with compile and run stage' do
      before do
        Excon.defaults[:mock] = true
        Excon.stub({ method: 'POST' }, Codaveri::EvaluateApiStubs.evaluate_result_with_compile_stage)
      end
      after do
        Excon.stubs.clear
      end
      it 'returns the result of evaluating' do
        result = subject.execute(course, question, answer.actable)
        expect(result).to be_a(Course::Assessment::ProgrammingCodaveriEvaluationService::Result)

        test_case_result = result[2][0]

        expect(test_case_result[:success]).to eq(0)
        expect(test_case_result[:output]).to be_empty
        expect(test_case_result[:error]).to_not be_empty
        expect(test_case_result[:stdout]).to eq("One\nTwo")
        expect(test_case_result[:stderr]).to eq("Three\nFour")
      end
    end

    describe '#construct_grading_object' do
      let(:service_instance) do
        subject.new(course, question, answer.actable, 1)
      end
      it 'constructs API payload correctly' do
        test_payload_object = service_instance.send(:construct_grading_object)
        actual_payload_object = JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/codaveri/codaveri_evaluation_test.json')),
          { symbolize_names: true }
        )

        expect(test_payload_object[:languageVersion]).to eq(actual_payload_object[:languageVersion])
        expect(test_payload_object[:files]).to eq(actual_payload_object[:files])
        expect(test_payload_object[:problemId]).to eq(actual_payload_object[:problemId])
        expect(test_payload_object[:courseName]).to eq(course.title)
      end
    end
  end
end
