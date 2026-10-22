# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::Programming::Python::PythonPackageService do
  include ProgrammingPackageServiceHelpers

  let(:service_dir) { Rails.root.join('app/services/course/assessment/question/programming/python') }

  describe '#generate_package' do
    context 'when the templates are code' do
      subject do
        described_class.new(package_params(submission: "def f():\n    pass", solution: "def f():\n    return 1")).
          generate_package(nil)
      end

      it 'writes template.py and pastes it into the tests with the existing Makefile' do
        files = package_files(subject)

        expect(files['submission/template.py']).to eq("def f():\n    pass\n")
        expect(files['solution/template.py']).to eq("def f():\n    return 1\n")
        expect(files['Makefile']).to eq(File.read(service_dir.join('python_makefile')))
        expect(package_meta(subject)).to include('submit_as_file' => false, 'submission_files' => [],
                                                 'solution_files' => [])
      end
    end

    context 'when the templates are files' do
      let(:submission_files) do
        [uploaded_file('app.py', 'from helpers import double'), uploaded_file('helpers.py', 'def double(x): pass')]
      end
      let(:solution_files) { [uploaded_file('helpers.py', 'def double(x): return 2 * x')] }

      subject do
        described_class.new(package_params(submit_as_file: 'true', submission_files: submission_files,
                                           solution_files: solution_files, prepend: 'import app as student')).
          generate_package(nil)
      end

      it 'writes every uploaded file and the Makefile that imports them instead of pasting' do
        files = package_files(subject)

        expect(files).to include('submission/app.py' => 'from helpers import double',
                                 'submission/helpers.py' => 'def double(x): pass',
                                 'solution/helpers.py' => 'def double(x): return 2 * x',
                                 'tests/prepend.py' => "import app as student\n")
        expect(files).not_to include('submission/template.py', 'solution/template.py')
        expect(files['Makefile']).to eq(File.read(service_dir.join('python_standard_makefile')))
      end

      it 'records the files in the meta' do
        meta = package_meta(subject)

        expect(meta['submit_as_file']).to be(true)
        expect(meta['submission_files'].map { |file| file['filename'] }).to eq(['app.py', 'helpers.py'])
        expect(meta['solution_files'].map { |file| file['filename'] }).to eq(['helpers.py'])
      end

      context 'when the question is edited' do
        let(:previous_package) { ProgrammingPackageServiceHelpers::PreviousPackage.new(subject.path) }

        it 'keeps the files that are not replaced or deleted' do
          package = described_class.new(package_params(submit_as_file: 'true', prepend: 'import app')).
                    generate_package(previous_package)

          expect(package_files(package)).to include('submission/app.py' => 'from helpers import double',
                                                    'submission/helpers.py' => 'def double(x): pass',
                                                    'solution/helpers.py' => 'def double(x): return 2 * x')
        end

        it 'replaces a file uploaded again under the same name, and removes deleted files' do
          params = package_params(submit_as_file: 'true',
                                  submission_files: [uploaded_file('helpers.py', 'def double(x): return x')])
          params[:question_programming][:solution_files_to_delete] = ['helpers.py']
          package = described_class.new(params).generate_package(previous_package)

          files = package_files(package)
          expect(files).to include('submission/app.py' => 'from helpers import double',
                                   'submission/helpers.py' => 'def double(x): return x')
          expect(files.keys).not_to include('solution/helpers.py')
        end

        it 'drops the files when switched to code' do
          package = described_class.new(package_params(submission: 'def f(): pass')).generate_package(previous_package)

          expect(package_files(package).keys.grep(/^(submission|solution)\//)).
            to contain_exactly('submission/template.py', 'solution/template.py')
          expect(package_meta(package)['submission_files']).to be_empty
        end
      end
    end

    context 'when a Java question with files is switched to Python' do
      let(:java_package) do
        Course::Assessment::Question::Programming::Java::JavaPackageService.new(
          package_params(submit_as_file: 'true', submission_files: [uploaded_file('Foo.java', 'class Foo {}')],
                         solution_files: [uploaded_file('Foo.java', 'class Foo { int x; }')])
        ).generate_package(nil)
      end
      let(:previous_package) { ProgrammingPackageServiceHelpers::PreviousPackage.new(java_package.path) }

      # ProgrammingPackageService asks for this when the question's language moves to another service.
      def regenerate(params)
        described_class.new(params).tap(&:language_changed!).generate_package(previous_package)
      end

      it 'keeps the Java files until the question creator removes or replaces them' do
        package = regenerate(package_params(submit_as_file: 'true'))

        files = package_files(package)
        expect(files).to include('submission/Foo.java' => 'class Foo {}', 'solution/Foo.java' => 'class Foo { int x; }')
        expect(files['Makefile']).to eq(File.read(service_dir.join('python_standard_makefile')))
        expect(package_meta(package)['submission_files'].map { |file| file['filename'] }).to eq(['Foo.java'])
      end

      it 'drops a Java file the question creator deletes' do
        params = package_params(submit_as_file: 'true', submission_files: [uploaded_file('app.py', 'x = 1')])
        params[:question_programming][:submission_files_to_delete] = ['Foo.java']
        package = regenerate(params)

        expect(package_files(package).keys.grep(/^submission\//)).to eq(['submission/app.py'])
      end
    end
  end

  describe '#submission_templates' do
    it 'returns the uploaded files when the templates are files' do
      service = described_class.new(package_params(submit_as_file: 'true',
                                                   submission_files: [uploaded_file('app.py', 'x = 1')]))

      expect(service.submission_templates).to eq([filename: 'app.py', content: 'x = 1'])
    end

    it 'returns template.py otherwise' do
      service = described_class.new(package_params(submission: 'x = 1'))

      expect(service.submission_templates).to eq([filename: 'template.py', content: 'x = 1'])
    end
  end
end
