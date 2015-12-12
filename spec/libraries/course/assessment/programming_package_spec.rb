require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingPackage do
  self::PACKAGE_PATH = File.join(Rails.root,
                                 'spec/fixtures/course/programming_question_template.zip')

  def temp_package_path
    temp_package_stream.tap(&:close).path
  end

  def temp_package_stream
    package_path = Rails.application.config.x.temp_folder.join('spec/packages')
    Dir.mkdir(package_path) unless Dir.exist?(package_path)
    Tempfile.create('programming_package', package_path)
  end

  def open_package(path)
    Course::Assessment::ProgrammingPackage.new(path)
  end

  let(:package_path) { self.class::PACKAGE_PATH }
  subject { open_package(package_path) }

  describe '#initialize' do
    context 'when a file path is specified' do
      it 'opens the file' do
        expect(subject.submission_files).not_to be_empty
      end
    end

    context 'when a file stream is specified' do
      let(:package_stream) { temp_package_stream }
      subject { open_package(package_stream) }
      before do
        IO.copy_stream(self.class::PACKAGE_PATH, package_stream)
        package_stream.seek(0)
      end

      it 'opens the file' do
        expect(subject.submission_files).not_to be_empty
      end
    end

    context 'when anything else is specified' do
      subject { open_package(3) }
      it 'fails with ArgumentError' do
        expect { subject }.to raise_error(ArgumentError)
      end
    end
  end

  describe '#path' do
    it 'returns the path to the package' do
      expect(subject.path).to eq(self.class::PACKAGE_PATH)
    end
  end

  describe '#close' do
    let(:package_path) { temp_package_path }
    before do
      FileUtils.copy(self.class::PACKAGE_PATH, package_path)
    end

    it 'persists changes to the package' do
      subject.submission_files = {}
      subject.close
      expect(open_package(package_path).submission_files).to be_empty
    end
  end

  describe '#submission_files' do
    it 'loads all the submission files' do
      expect(subject.submission_files).to eq(Pathname.new('__init__.py') => '')
    end
  end

  describe '#submission_files=' do
    it 'replaces all existing submission files' do
      replacement = { Pathname.new('test.py') => 'test!' }
      expect(subject.submission_files = replacement).to eq(replacement)
      expect(subject.submission_files).to eq(replacement)
    end
  end

  describe '#ensure_file_open!' do
    context 'when the file cannot be opened' do
      it 'raises an IllegalStateError' do
        subject.instance_variable_set(:@path, nil)
        expect { subject.submission_files }.to raise_error(IllegalStateError)
      end
    end
  end
end
