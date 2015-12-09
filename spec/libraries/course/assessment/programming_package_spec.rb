require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingPackage do
  self::PACKAGE_PATH = File.join(Rails.root,
                                 'spec/fixtures/course/programming_question_template.zip')
  self::TEMP_PACKAGE_PATH = File.join(Rails.root, 'tmp/spec')

  def temp_package_path
    package_path = self.class::TEMP_PACKAGE_PATH
    Dir.mkdir(package_path) unless Dir.exist?(package_path)
    Tempfile.create('programming_package', package_path).tap(&:close).path
  end

  def open_package(path)
    Course::Assessment::ProgrammingPackage.new(path)
  end

  let(:package_path) { self.class::PACKAGE_PATH }
  subject { open_package(package_path) }

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
end
