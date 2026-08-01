# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingCodaveri::LanguagePackageService do
  let(:package_path) do
    File.join(Rails.root, 'spec/fixtures/course/programming_question_template_codaveri_empty_data_file.zip')
  end
  let(:package) { Course::Assessment::ProgrammingPackage.new(package_path) }
  let(:main_files) { package.main_files }
  let(:test_files) { package.test_files }
  subject { described_class.new(nil, package) }

  def extract(filename, content)
    subject.send(:extract_supporting_file, filename, content)
    subject.data_files.last
  end

  describe '.extract_supporting_file' do
    context 'when the file is valid UTF-8 plaintext' do
      it 'extracts the content as utf8' do
        filename = Pathname.new('data.csv')

        expect(extract(filename, main_files[filename])).to eq(
          type: 'internal',
          path: 'data.csv',
          content: "codon,amino_acid\nAAA,Lys\nAAC,Asn\n",
          encoding: 'utf8'
        )
      end
    end

    context 'when the file is not valid UTF-8' do
      it 'extracts the content as base64' do
        filename = Pathname.new('binary.dat')

        expect(extract(filename, main_files[filename])).to eq(
          type: 'internal',
          path: 'binary.dat',
          content: Base64.strict_encode64("\xFF\xFE\x00\x01\x02".b),
          encoding: 'base64'
        )
      end
    end

    # Zero-byte zip entries are read back as a frozen empty string, which used to be mutated
    # in place by `force_encoding` and raise FrozenError.
    context 'when the file is empty' do
      it 'extracts the file as empty utf8 content' do
        filename = Pathname.new('empty.csv')
        content = main_files[filename]
        expect(content).to be_frozen

        expect(extract(filename, content)).to eq(
          type: 'internal',
          path: 'empty.csv',
          content: '',
          encoding: 'utf8'
        )
      end

      it 'extracts a zero-byte file in the tests folder' do
        filename = Pathname.new('empty.csv')

        expect { extract(filename, test_files[filename]) }.not_to raise_error
      end
    end

    it 'does not re-tag the encoding of the content read from the package' do
      filename = Pathname.new('data.csv')
      content = main_files[filename]

      extract(filename, content)

      expect(content.encoding).to eq(Encoding::ASCII_8BIT)
    end

    it 'appends every extracted file to the data files' do
      subject.send(:extract_supporting_file, Pathname.new('data.csv'), main_files[Pathname.new('data.csv')])
      subject.send(:extract_supporting_file, Pathname.new('empty.csv'), test_files[Pathname.new('empty.csv')])

      expect(subject.data_files.map { |file| file[:path] }).to eq(['data.csv', 'empty.csv'])
    end
  end

  describe '.utf8_encodable?' do
    it 'accepts any valid UTF-8 content' do
      expect(subject.send(:utf8_encodable?, Pathname.new('data.csv'), 'plaintext')).to eq(true)
      expect(subject.send(:utf8_encodable?, Pathname.new('empty.csv'), '')).to eq(true)
      expect(subject.send(:utf8_encodable?, Pathname.new('binary.dat'), "\xFF\xFE".b.force_encoding('UTF-8'))).
        to eq(false)
    end

    # The Java package service narrows the base implementation, pending Codaveri 'utf8' encoding
    # support for all plaintext files in compiled languages.
    context 'when the concrete service restricts utf8 encoding' do
      subject { Course::Assessment::Question::ProgrammingCodaveri::Java::JavaPackageService.new(nil, package) }

      it 'only accepts plaintext files that require compiling' do
        expect(subject.send(:utf8_encodable?, Pathname.new('Helper.java'), 'class Helper {}')).to eq(true)
        expect(subject.send(:utf8_encodable?, Pathname.new('data.csv'), 'plaintext')).to eq(false)
      end

      it 'extracts an empty supporting file as base64' do
        filename = Pathname.new('empty.csv')

        expect(extract(filename, main_files[filename])).to eq(
          type: 'internal',
          path: 'empty.csv',
          content: '',
          encoding: 'base64'
        )
      end
    end
  end
end
