# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingImportService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:question) { create(:course_assessment_question_programming, template_file_count: 0) }
    let(:package_path) do
      File.join(Rails.root, 'spec/fixtures/course/programming_question_template.zip')
    end
    let(:attachment) { create(:attachment, binary: true, file: package_path) }
    subject { Course::Assessment::Question::ProgrammingImportService.new(question, attachment) }

    describe '.import' do
      subject { Course::Assessment::Question::ProgrammingImportService }
      it 'accepts attachments' do
        expect(subject).to receive(:new).
          with(question, instance_of(Attachment)).
          and_call_original
        subject.import(question, attachment)
      end

      context 'when an invalid package is provided' do
        let(:package_path) do
          File.join(Rails.root, 'spec/fixtures/course/empty_programming_question_template.zip')
        end

        it 'raises an InvalidDataError' do
          expect { subject.import(question, attachment) }.to raise_error(InvalidDataError)
        end
      end
    end

    describe '#import' do
      it 'imports the test cases' do
        subject.send(:import)
        expect(question.test_cases).not_to be_empty
      end

      it 'imports the template files' do
        subject.send(:import)
        expect(question.template_files).not_to be_empty
        expect(question.template_files.map(&:filename)).to contain_exactly('__init__.py')
      end

      context 'when the evaluation fails' do
        it 'raises an Course::Assessment::ProgrammingEvaluationService::Error' do
          mock_result = Course::Assessment::ProgrammingEvaluationService::Result.new('', '', nil, 1)
          expect(subject).to receive(:evaluate_package).and_return(mock_result)

          expect { subject.send(:import) }.to \
            raise_error(Course::Assessment::ProgrammingEvaluationService::Error)
        end
      end
    end
  end
end
