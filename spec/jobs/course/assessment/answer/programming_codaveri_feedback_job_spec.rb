# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingCodaveriFeedbackJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Course::Assessment::Answer::ProgrammingCodaveriFeedbackJob }
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

    it 'can be queued' do
      expect { subject.perform_later(assessment, question, answer.actable) }.to \
        have_enqueued_job(subject).exactly(:once)
    end

    it 'can be run' do
      subject.perform_now(assessment, question, answer.actable)
    end
  end
end
