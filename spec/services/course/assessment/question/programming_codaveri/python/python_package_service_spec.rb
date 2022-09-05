# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingCodaveri::Python::PythonPackageService do
  let!(:instance) { create(:instance, :with_codaveri_component_enabled) }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_codaveri_component_enabled) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:question) do
      create(:course_assessment_question_programming, template_file_count: 0, package_type: :zip_upload,
                                                      assessment: assessment, is_codaveri: true)
    end
    let(:package_path) do
      File.join(Rails.root, 'spec/fixtures/course/programming_question_template_codaveri.zip')
    end
    let(:attachment) { create(:attachment_reference, binary: true, file_path: package_path) }
    let(:package) { Course::Assessment::ProgrammingPackage.new(package_path) }
    subject { Course::Assessment::Question::ProgrammingCodaveri::Python::PythonPackageService.new(question, package) }

    before do
      Course::Assessment::Question::ProgrammingImportService.import(question, attachment)
    end

    describe '.preload_question_test_cases' do
      it 'preloads all the tests cases of the question' do
        test_cases = subject.send(:preload_question_test_cases)
        expect(test_cases.keys).to match_array(['test_public_1', 'test_private_2', 'test_evaluation_3'])
      end
    end

    describe '.assertion_types_regex' do
      it 'loads the correct regex type' do
        regex_types = subject.send(:assertion_types_regex)
        expect(regex_types[:Equal].call('left value, right value')).to eq('left value == right value')
        expect(regex_types[:NotEqual].call('left value, right value')).to eq('left value != right value')
        expect(regex_types[:True].call('value')).to eq('value')
        expect(regex_types[:False].call('value')).to eq('not value')
        expect(regex_types[:Is].call('left value, right value')).to eq('left value is right value')
        expect(regex_types[:IsNot].call('left value, right value')).to eq('left value is not right value')
        expect(regex_types[:IsNone].call('value')).to eq('value is None')
        expect(regex_types[:IsNotNone].call('value')).to eq('value is not None')
      end
    end

    describe '.top_level_split' do
      it 'splits the string correctly' do
        split_result = subject.send(:top_level_split, 'Testing (a, b),c', ',')
        expect(split_result).to match_array(['Testing (a, b)', 'c'])
      end

      context 'when the input string is invalid' do
        it 'raises the correct error' do
          expect do
            subject.send(:top_level_split, 'asdf', ',')
          end.to raise_error(TypeError)
        end
      end
    end
  end
end
