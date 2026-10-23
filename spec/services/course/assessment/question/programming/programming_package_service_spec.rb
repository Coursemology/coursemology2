# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::Programming::ProgrammingPackageService do
  include ProgrammingPackageServiceHelpers

  let(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#generate_package' do
      let(:question) { create(:course_assessment_question_programming) }
      let(:params) { package_params(submission: 'x = 1', solution: 'x = 2') }

      def language_package_service_after_switching_to(language)
        question.language = language
        service = described_class.new(question, params)
        language_package_service = service.instance_variable_get(:@language_package_service)
        allow(language_package_service).to receive(:language_changed!).and_call_original
        service.generate_package
        language_package_service
      end

      it 'rebuilds the package when the language changes to another language' do
        language_package_service =
          language_package_service_after_switching_to(Coursemology::Polyglot::Language::Java::Java17.instance)

        expect(language_package_service).to have_received(:language_changed!)
      end

      it 'rebuilds the package when only the language version changes' do
        language_package_service =
          language_package_service_after_switching_to(Coursemology::Polyglot::Language::Python::Python3Point12.instance)

        expect(language_package_service).to have_received(:language_changed!)
      end

      it 'does not when the language is unchanged' do
        language_package_service = language_package_service_after_switching_to(question.language)

        expect(language_package_service).not_to have_received(:language_changed!)
      end
    end
  end

  describe 'the language package services' do
    [
      Course::Assessment::Question::Programming::Python::PythonPackageService,
      Course::Assessment::Question::Programming::Cpp::CppPackageService,
      Course::Assessment::Question::Programming::Java::JavaPackageService,
      Course::Assessment::Question::Programming::R::RPackageService,
      Course::Assessment::Question::Programming::CSharp::CSharpPackageService,
      Course::Assessment::Question::Programming::JavaScript::JavaScriptPackageService,
      Course::Assessment::Question::Programming::Go::GoPackageService,
      Course::Assessment::Question::Programming::Rust::RustPackageService,
      Course::Assessment::Question::Programming::TypeScript::TypeScriptPackageService
    ].each do |service_class|
      context service_class.name.demodulize do
        let(:params) { package_params(submission: 'code', solution: 'solution') }
        let(:previous_package) do
          ProgrammingPackageServiceHelpers::PreviousPackage.new(service_class.new(params).generate_package(nil).path)
        end

        it 'builds no new package when nothing changed' do
          expect(service_class.new(params).generate_package(previous_package)).to be_nil
        end

        it 'builds a new package when the language changed, even if nothing else did' do
          service = service_class.new(params).tap(&:language_changed!)

          expect(service.generate_package(previous_package)).to be_present
        end

        context 'with a data file in a folder' do
          let(:previous_package) do
            params = package_params(submission: 'code', solution: 'solution',
                                    data_files: [uploaded_file('a.csv', 'x,y')], data_file_paths: ['data/a.csv'])
            ProgrammingPackageServiceHelpers::PreviousPackage.new(service_class.new(params).generate_package(nil).path)
          end

          it 'builds no new package when saved again without changes' do
            expect(service_class.new(package_params(submission: 'code', solution: 'solution')).
              generate_package(previous_package)).to be_nil
          end

          it 'keeps the file in its folder when the package is rebuilt' do
            package = service_class.new(package_params(submission: 'changed', solution: 'solution')).
                      generate_package(previous_package)

            expect(package_files(package)).to include('data/a.csv' => 'x,y')
            expect(package_meta(package)['data_files'].pluck('filename')).to eq(['data/a.csv'])
          end
        end

        context 'with an empty data file' do
          let(:previous_package) do
            params = package_params(submission: 'code', solution: 'solution',
                                    data_files: [uploaded_file('empty.csv', '')], data_file_paths: ['data/empty.csv'])
            ProgrammingPackageServiceHelpers::PreviousPackage.new(service_class.new(params).generate_package(nil).path)
          end

          it 'keeps the file, still empty, when the package is rebuilt' do
            package = service_class.new(package_params(submission: 'changed', solution: 'solution')).
                      generate_package(previous_package)

            expect(package_files(package)).to include('data/empty.csv' => '')
            expect(package_meta(package)['data_files'].pluck('filename', 'size')).to eq([['data/empty.csv', 0]])
          end
        end
      end
    end
  end
end
