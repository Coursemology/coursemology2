require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingImportService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:question) { create(:course_assessment_question_programming, template_file_count: 0) }
    let(:package_path) do
      File.join(Rails.root, 'spec/fixtures/course/programming_question_template.zip')
    end
    let(:package) { Course::Assessment::ProgrammingPackage.new(package_path) }
    subject { Course::Assessment::Question::ProgrammingImportService.new(question, package) }

    describe '.import' do
      subject { Course::Assessment::Question::ProgrammingImportService }
      it 'accepts package file paths' do
        expect(subject).to receive(:new).
          with(question, instance_of(Course::Assessment::ProgrammingPackage)).
          and_call_original
        subject.import(question, package_path)
      end

      it 'accepts package file streams' do
        File.open(package_path, 'rb') do |file|
          subject.import(question, file)
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
    end
  end
end
