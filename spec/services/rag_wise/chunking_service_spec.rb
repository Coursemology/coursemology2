# frozen_string_literal: true
require 'rails_helper'

RSpec.describe RagWise::ChunkingService, type: :service do
  describe '#initialize' do
    it 'raises an error if neither text nor file is provided' do
      expect { described_class.new }.to raise_error(ArgumentError, 'Either text or file must be provided')
    end

    it 'initializes with text and processes it' do
      service = described_class.new(text: '   Hello   World   ')
      expect(service.instance_variable_get(:@text)).to eq('Hello World')
    end

    it 'initializes with a file and determines the file type' do
      file = double('file', path: '/path/to/file.txt')
      service = described_class.new(file: file, file_name: file.path)
      expect(service.instance_variable_get(:@file_type)).to eq('.txt')
    end
  end

  describe '#file_chunking' do
    let(:txt_file) { File.open(File.join(Rails.root, '/spec/fixtures/files/text.txt')) }
    let(:pdf_file) { File.open(File.join(Rails.root, '/spec/fixtures/files/two-page-document-with-text.pdf')) }
    it 'reads and processes .txt files' do
      service = described_class.new(file: txt_file, file_name: txt_file.path)
      chunks = service.file_chunking
      # chunk size is 500 with 100 overlap
      expected_chunks = ['This is a test file']
      expect(chunks).to eq(expected_chunks)
    end

    it 'reads and processes .pdf files' do
      service = described_class.new(file: pdf_file, file_name: pdf_file.path)
      chunks = service.file_chunking
      # chunk size is 500 with 100 overlap
      expected_chunks = ['testing testing']
      expect(chunks).to eq(expected_chunks)
    end

    it 'raises an error for unsupported file types' do
      file = double('file', path: '/path/to/file.xyz')
      service = described_class.new(file: file, file_name: file.path)
      allow(File).to receive(:extname).with('/path/to/file.xyz').and_return('.xyz')
      expect { service.file_chunking }.to raise_error(RuntimeError, 'Unsupported file type: .xyz')
    end
  end

  # text chunking method depends on fixed_size_chunk_text (private)
  describe '#fixed_size_chunk_text (private)' do
    it 'splits text into fixed-size chunks with overlap' do
      service = described_class.new(text: 'abcdefghij')
      chunks = service.send(:fixed_size_chunk_text, 5, 2)
      expect(chunks).to eq(['abcde', 'defgh', 'ghij'])
    end

    it 'handles edge cases with very short text' do
      service = described_class.new(text: 'abc')
      chunks = service.send(:fixed_size_chunk_text, 5, 2)
      expect(chunks).to eq(['abc'])
    end
  end
end
