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
    let(:ipynb_file) { File.open(File.join(Rails.root, '/spec/fixtures/files/template_ipynb.ipynb')) }
    let(:docx_file) { File.open(File.join(Rails.root, '/spec/fixtures/files/one-page-word-document.docx')) }
    it 'reads and processes .txt files' do
      service = described_class.new(file: txt_file, file_name: txt_file.path)
      chunks = service.file_chunking

      expected_chunks = ['This is a test file']
      expect(chunks).to eq(expected_chunks)
    end

    it 'reads and processes .pdf files' do
      service = described_class.new(file: pdf_file, file_name: pdf_file.path)
      chunks = service.file_chunking

      expected_chunks = ['testing testing']
      expect(chunks).to eq(expected_chunks)
    end

    it 'reads and processes .ipynb files' do
      service = described_class.new(file: ipynb_file, file_name: ipynb_file.path)
      chunks = service.file_chunking

      expected_chunks = ["test print('test')"]
      expect(chunks).to eq(expected_chunks)
    end

    it 'reads and processes .docx files' do
      service = described_class.new(file: docx_file, file_name: docx_file.path)
      chunks = service.file_chunking

      expected_chunks = ['This is a testing word document.']
      expect(chunks).to eq(expected_chunks)
    end

    it 'raises an error for unsupported file types' do
      file = double('file', path: '/path/to/file.xyz')
      service = described_class.new(file: file, file_name: file.path)
      allow(File).to receive(:extname).with('/path/to/file.xyz').and_return('.xyz')
      expect { service.file_chunking }.to raise_error(RuntimeError, 'Unsupported file type: .xyz')
    end
  end
end
