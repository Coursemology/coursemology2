# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CoursemologyDockerContainer do
  let(:image) { 'coursemology/evaluator-image-python:2.7' }
  let(:package) do
    Rails.root.join('spec', 'fixtures', 'course', 'programming_question_template.zip')
  end
  subject { CoursemologyDockerContainer.create(image) }

  describe '#wait' do
    it 'retries until the container finishes' do
      subject.start!

      called = 0
      expect(subject.connection).to receive(:post).and_wrap_original do |block, *args|
        excon_params = args.third
        excon_params[:read_timeout] = called == 0 ? 0 : nil
        called += 1

        block.call(*args)
      end.at_least(:twice)

      expect(subject.wait(0.01)).not_to be_nil
    end

    it 'returns the exit code of the container' do
      expect(subject.wait).to eq(subject.exit_code)
    end
  end

  describe '#exit_code' do
    context 'when the container has been waited upon' do
      it 'returns the exit code of the container' do
        subject.wait
        expect(subject.exit_code).not_to be_nil
      end
    end

    context 'when the container is still running' do
      it 'returns nil' do
        expect(subject.exit_code).to be_nil
      end
    end
  end

  describe '#copy_package' do
    it 'copies to the home directory' do
      expect(subject).to receive(:archive_in_stream).with(subject.class::HOME_PATH)
      subject.send(:copy_package, package)
    end
  end

  describe '#tar_package' do
    let(:tar_stream) { subject.send(:tar_package, package) }
    it 'resets the stream to the start' do
      expect(tar_stream.tell).to eq(0)
    end

    it 'copies all files, prefixed with the package directory name' do
      tar = Gem::Package::TarReader.new(tar_stream)
      entries = []
      tar.each do |entry|
        entries << entry.full_name
      end

      expect(entries).to contain_exactly('package/Makefile', 'package/submission/__init__.py')
    end
  end

  describe '#execute_package' do
    after { subject.send(:delete) }

    def evaluate_result
      expect(subject).to receive(:start!).and_call_original
      subject.send(:execute_package)
    end

    it 'evaluates the result' do
      evaluate_result
    end

    it 'returns only when the container has stopped running' do
      evaluate_result
      subject.refresh!
      expect(subject.info['State']['Running']).to be(false)
    end
  end

  describe '#evaluation_result' do
    before { subject.send(:execute_package) }
    after { subject.send(:delete) }

    it 'does not expose raw Docker Attach Protocol in the output' do
      stdout, stderr = subject.send(:evaluation_result)
      expect(stdout).not_to include("\u0000")
      expect(stderr).not_to include("\u0000")
    end

    it 'sets the return code of the container' do
      _, _, _, exit_code = subject.send(:evaluation_result)
      expect(exit_code).to eq(2)
    end
  end

  describe '#extract_test_report' do
    let(:report_path) do
      Rails.root.join('spec', 'fixtures', 'course', 'programming_single_test_suite_report.xml')
    end
    let(:report_contents) { File.read(report_path) }

    def copy_report(contents)
      subject.start!
      subject.wait
      tar = StringIO.new(Docker::Util.create_tar('report.xml' => contents))
      subject.archive_in_stream(CoursemologyDockerContainer::PACKAGE_PATH) { tar.read }
    end

    after { subject.send(:delete) }

    it 'returns the test report' do
      copy_report(report_contents)
      test_report = subject.send(:extract_test_report)
      expect(test_report).to eq(report_contents)
      expect(test_report.encoding).to eq Encoding::UTF_8
    end

    it 'does not crash when report is nil' do
      copy_report(nil)
      test_report = subject.send(:extract_test_report)
      expect(test_report).to be_nil
    end

    context 'when running the tests fails' do
      it 'returns nil' do
        expect(subject.send(:extract_test_report)).to be_nil
      end
    end
  end
end
