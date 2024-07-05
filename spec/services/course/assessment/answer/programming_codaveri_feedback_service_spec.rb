# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingCodaveriAsyncFeedbackService do
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
        "def to_rna(tagged_data):\r\n    tag_type = get_tag_type(tagged_data)\r\n    data     = get_data(tagged_data)\r\n    op       = get_op(\"to_rna\", (tag_type,))\r\n    return tag(\"rna\", op(data))\r\n\r\ndef is_same_dogma(tagged_data1, tagged_data2):\r\n    tag_type1 = get_tag_type(tagged_data1)\r\n    tag_type2 = get_tag_type(tagged_data2)\r\n    op        = get_op(\"is_same_dogma\", (tag_type1, tag_type2))\r\n    data1     = get_data(tagged_data1)\r\n    data2     = get_data(tagged_data2)\r\n    return op(data1, data2)"
      end

      before do
        Excon.defaults[:mock] = true
      end

      # rubocop:enable Layout/LineLength
      subject do
        Course::Assessment::Answer::ProgrammingCodaveriAsyncFeedbackService.new(
          assessment, question, answer.actable, 'solution', true
        )
      end

      describe '#construct_feedback_object' do
        it 'constructs API payload correctly' do
          instance_object = subject
          test_payload_object = instance_object.send(:construct_feedback_object)

          actual_payload_object = JSON.parse(
            File.read(File.join(Rails.root,
                                'spec/fixtures/course/codaveri/codaveri_feedback_test.json')),
            { symbolize_names: true }
          )

          expect(test_payload_object[:courseName]).to eq(course.title)
          expect(test_payload_object[:languageVersion]).to eq(actual_payload_object[:languageVersion])
          test_payload_object[:files].each_with_index do |test_file_object, index|
            expect(test_file_object.except(:path)).to eq(actual_payload_object[:files][index].except(:path))
          end
          # expect(test_payload_object[:files]).to eq(actual_payload_object[:files])
          expect(test_payload_object[:problemId]).to eq(actual_payload_object[:problemId])
          expect(test_payload_object[:requireToken]).to eq(actual_payload_object[:requireToken])

          # TODO: currently we have placeholders for several fields (e.g. tone),
          # refine this assertion once API request model is fully finalized
          expect(test_payload_object[:config]).to include(actual_payload_object[:config])
        end
      end
    end
  end
end
