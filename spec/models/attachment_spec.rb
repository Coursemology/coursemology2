# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Attachment do
  let(:file_path) { File.join(Rails.root, '/spec/fixtures/files/text.txt') }
  subject { build(:attachment, file: file_path) }

  it { is_expected.to belong_to(:attachable) }
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
end
