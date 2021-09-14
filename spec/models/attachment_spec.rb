# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Attachment do
  let(:file_path) { File.join(Rails.root, '/spec/fixtures/files/text.txt') }
  subject { build(:attachment, file: file_path) }

  it { is_expected.to have_many(:attachment_references).dependent(:destroy) }
  it { is_expected.to respond_to(:url) }
  it { is_expected.to respond_to(:path) }

  describe '#open' do
    context 'when a block is provided' do
      it 'yields a stream' do
        subject.open do |file|
          expect(file).to be_a(IO)
        end
      end

      it 'contains the contents of the file' do
        subject.open do |file|
          File.open(file_path) do |template_file|
            expect(FileUtils.compare_stream(template_file, file)).to be(true)
          end
        end
      end
    end

    context 'when no block is given' do
      let(:file) { subject.open }
      after { file.close }
      it 'returns a stream' do
        expect(file).to be_a(Tempfile).or be_a(IO).or be_a(StringIO)
      end

      it 'contains the contents of the file' do
        File.open(file_path) do |template_file|
          expect(FileUtils.compare_stream(template_file, file)).to be(true)
        end
      end
    end
  end

  describe '#open_without_block' do
    let(:file) { subject.open }

    it 'closes the file when an error occurs' do
      tempfile = nil
      expect(Tempfile).to receive(:new).and_wrap_original do |method, *args|
        tempfile = method.call(*args)
        tempfile.define_singleton_method(:seek) do |*|
          raise IOError
        end
        tempfile
      end.at_least(:once)

      expect { file }.to raise_error(IOError)
      expect(tempfile).to be_closed
    end
  end

  let(:file) { Rack::Test::UploadedFile.new(file_path) }
  describe '.find_or_initialize_by' do
    subject { Attachment.find_or_initialize_by(file: file) }

    it 'finds or initializes an attachment from file' do
      expect(subject).to be_present
      expect(subject.file_upload.file).not_to be_nil
    end

    context 'when the file hash does not exist' do
      let(:file) do
        file = Tempfile.new('')
        file.write(SecureRandom.hex)
        file.close
        file
      end

      it 'initializes an attachment' do
        expect(subject).to be_new_record
        expect(subject.file_upload.file).not_to be_nil
      end
    end
  end

  describe '.find_or_create_by' do
    subject { Attachment.find_or_create_by(file: file) }

    it 'finds or creates an attachment from file' do
      expect(subject).to be_present
      expect(subject).to be_persisted
      expect(subject.file_upload.file).not_to be_nil
    end

    context 'when the file hash does not exist' do
      let(:file) do
        file = Tempfile.new('')
        file.write(SecureRandom.hex)
        file.close
        file
      end

      it 'creates an attachment' do
        expect(subject).to be_persisted
        expect(subject.file_upload.file).not_to be_nil
      end
    end
  end

  describe '#path' do
    it 'returns a path based on the split form of the name' do
      attachment = create(:attachment, name: "abcdef#{SecureRandom.hex(32)}")
      expect(attachment.path).
        to start_with(File.join(Rails.public_path, '/uploads/attachments/ab/cd/ef'))
    end
  end
end
