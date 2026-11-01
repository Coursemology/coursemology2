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

          it 'replaces the file with an upload under a name that differs only in case' do
            params = package_params(submission: 'code', solution: 'solution',
                                    data_files: [uploaded_file('A.csv', 'new')], data_file_paths: ['data/A.csv'],
                                    data_files_to_delete: ['data/a.csv'])
            package = service_class.new(params).generate_package(previous_package)

            expect(package_files(package)).to include('data/A.csv' => 'new')
            expect(package_files(package).keys).not_to include('data/a.csv')
            expect(package_meta(package)['data_files'].pluck('filename')).to eq(['data/A.csv'])
          end
        end

        context 'with data files to move' do
          let(:previous_package) do
            params = package_params(submission: 'code', solution: 'solution',
                                    data_files: [uploaded_file('a.csv', 'a'), uploaded_file('b.csv', 'b')],
                                    data_file_paths: ['data/a.csv', 'data/b.csv'])
            ProgrammingPackageServiceHelpers::PreviousPackage.new(service_class.new(params).generate_package(nil).path)
          end

          # A `def` can't see the loop's `service_class`; a `let` block can.
          let(:service) { service_class }

          def move(from, to, **fields)
            params = package_params(submission: 'code', solution: 'solution',
                                    data_files_to_move_from: from, data_files_to_move_to: to, **fields)
            service.new(params).generate_package(previous_package)
          end

          it 'keeps moved files under their new paths, with their content' do
            package = move(['data/a.csv', 'data/b.csv'], ['input/a.csv', 'B.csv'])

            expect(package_files(package)).to include('input/a.csv' => 'a', 'B.csv' => 'b')
            expect(package_files(package).keys).not_to include('data/a.csv', 'data/b.csv')
            expect(package_meta(package)['data_files'].pluck('filename')).to contain_exactly('input/a.csv', 'B.csv')
          end

          it 'moves a file to its own path in another case' do
            expect(package_files(move(['data/a.csv'], ['data/A.csv']))).to include('data/A.csv' => 'a')
          end

          it 'keeps a moved file when an upload takes its old path' do
            package = move(['data/a.csv'], ['data/c.csv'],
                           data_files: [uploaded_file('a.csv', 'new')], data_file_paths: ['data/a.csv'])

            expect(package_files(package)).to include('data/c.csv' => 'a', 'data/a.csv' => 'new')
          end

          it "refuses a move onto another file's path, even one being deleted or moved" do
            expect { move(['data/a.csv'], ['data/B.csv']) }.
              to raise_error(Course::Assessment::ProgrammingFilePath::InvalidPathError)
            expect { move(['data/a.csv'], ['data/b.csv'], data_files_to_delete: ['data/b.csv']) }.
              to raise_error(Course::Assessment::ProgrammingFilePath::InvalidPathError)
            expect { move(['data/a.csv', 'data/b.csv'], ['data/b.csv', 'data/a.csv']) }.
              to raise_error(Course::Assessment::ProgrammingFilePath::InvalidPathError)
          end

          it 'refuses to move a file being deleted, or one that does not exist' do
            expect { move(['data/a.csv'], ['data/c.csv'], data_files_to_delete: ['data/a.csv']) }.
              to raise_error(Course::Assessment::ProgrammingFilePath::InvalidPathError)
            expect { move(['data/x.csv'], ['data/c.csv']) }.
              to raise_error(Course::Assessment::ProgrammingFilePath::InvalidPathError)
          end

          it 'refuses moves whose lists do not pair up, or a new path that breaks the rules' do
            expect { move(['data/a.csv'], []) }.
              to raise_error(Course::Assessment::ProgrammingFilePath::InvalidPathError)
            expect { move(['data/a.csv'], ['../a.csv']) }.
              to raise_error(Course::Assessment::ProgrammingFilePath::InvalidPathError)
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
