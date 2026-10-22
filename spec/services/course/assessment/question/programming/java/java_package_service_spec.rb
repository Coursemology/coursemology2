# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::Programming::Java::JavaPackageService do
  include ProgrammingPackageServiceHelpers

  let(:service_dir) { Rails.root.join('app/services/course/assessment/question/programming/java') }

  describe '#generate_package' do
    context 'when the templates are code' do
      subject do
        described_class.new(package_params(submission: 'int f() { return 0; }', solution: 'int f() { return 1; }')).
          generate_package(nil)
      end

      it 'writes the template and solution as single files with the simple Makefile' do
        files = package_files(subject)

        expect(files['submission/template']).to eq("int f() { return 0; }\n")
        expect(files['solution/template']).to eq('int f() { return 1; }')
        expect(files['Makefile']).to eq(File.read(service_dir.join('java_simple_makefile')))
        expect(package_meta(subject)['submit_as_file']).to be(false)
      end
    end

    context 'when the templates are files' do
      let(:submission_files) { [uploaded_file('Foo.java', 'class Foo {}'), uploaded_file('Bar.java', 'class Bar {}')] }
      let(:solution_files) { [uploaded_file('Foo.java', 'class Foo { int x; }')] }

      subject do
        described_class.new(package_params(submit_as_file: 'true', submission_files: submission_files,
                                           solution_files: solution_files)).generate_package(nil)
      end

      it 'writes every uploaded file with the standard Makefile' do
        files = package_files(subject)

        expect(files).to include('submission/Foo.java' => 'class Foo {}', 'submission/Bar.java' => 'class Bar {}',
                                 'solution/Foo.java' => 'class Foo { int x; }')
        expect(files).not_to include('submission/template', 'solution/template')
        expect(files['Makefile']).to eq(File.read(service_dir.join('java_standard_makefile')))
      end

      it 'records the files in the meta, sorted by name' do
        meta = package_meta(subject)

        expect(meta['submit_as_file']).to be(true)
        expect(meta['submission_files'].map { |file| file['filename'] }).to eq(['Bar.java', 'Foo.java'])
        expect(meta['solution_files'].first).to include('filename' => 'Foo.java', 'size' => 20,
                                                        'hash' => Digest::SHA256.hexdigest('class Foo { int x; }'))
      end

      context 'when the question is edited' do
        let(:previous_package) { ProgrammingPackageServiceHelpers::PreviousPackage.new(subject.path) }

        def regenerate(**fields)
          described_class.new(package_params(submit_as_file: 'true', **fields)).generate_package(previous_package)
        end

        it 'keeps the files that are not replaced or deleted' do
          package = regenerate(prepend: 'import java.util.*;')

          expect(package_files(package)).to include('submission/Foo.java' => 'class Foo {}',
                                                    'submission/Bar.java' => 'class Bar {}',
                                                    'solution/Foo.java' => 'class Foo { int x; }')
        end

        it 'replaces a file uploaded again under the same name' do
          package = regenerate(submission_files: [uploaded_file('Foo.java', 'class Foo { void f() {} }')])

          expect(package_files(package)).to include('submission/Foo.java' => 'class Foo { void f() {} }',
                                                    'submission/Bar.java' => 'class Bar {}')
        end

        it 'removes deleted files' do
          params = package_params(submit_as_file: 'true')
          params[:question_programming][:submission_files_to_delete] = ['Bar.java']
          package = described_class.new(params).generate_package(previous_package)

          expect(package_files(package).keys).not_to include('submission/Bar.java')
          expect(package_meta(package)['submission_files'].map { |file| file['filename'] }).to eq(['Foo.java'])
        end

        it 'returns nothing when nothing changed' do
          expect(regenerate).to be_nil
        end

        it 'drops the files when switched to code, so switching back does not look for them' do
          code_package = described_class.new(package_params(submission: 'int f() { return 0; }')).
                         generate_package(previous_package)
          expect(package_meta(code_package)['submission_files']).to be_empty

          file_package = described_class.new(package_params(submit_as_file: 'true')).
                         generate_package(ProgrammingPackageServiceHelpers::PreviousPackage.new(code_package.path))
          expect(package_meta(file_package)['submission_files']).to be_empty
        end
      end
    end
  end

  describe '#submission_templates' do
    it 'returns the uploaded files when the templates are files' do
      service = described_class.new(package_params(submit_as_file: 'true',
                                                   submission_files: [uploaded_file('Foo.java', 'class Foo {}')]))

      expect(service.submission_templates).to eq([filename: 'Foo.java', content: 'class Foo {}'])
    end

    it 'returns the code template otherwise' do
      service = described_class.new(package_params(submission: 'int f() { return 0; }'))

      expect(service.submission_templates).to eq([filename: 'template', content: 'int f() { return 0; }'])
    end
  end
end
