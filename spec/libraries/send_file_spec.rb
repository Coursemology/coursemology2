# frozen_string_literal: true
require 'rails_helper'

RSpec.describe SendFile do
  let(:file) do
    file = Tempfile.new('test file')
    file << 'lol'
    file.close
    file.path
  end

  describe '.publish_file' do
    subject { SendFile.send_file(file) }

    it 'preserves the original file name' do
      expect(File.basename(URI.decode_www_form_component(subject))).to eq(File.basename(file))
    end

    it 'copies the file' do
      public_file = File.join(Rails.public_path, URI.decode_www_form_component(subject))
      expect(FileUtils.compare_file(public_file, file)).to be_truthy
    end

    context 'when a custom name is given' do
      let(:file_name) { 'Name with whitespaces' }
      subject { SendFile.send_file(file, file_name) }

      it 'uses the custom name' do
        expect(File.basename(URI.decode_www_form_component(subject))).to eq(file_name)
      end
    end
  end

  describe '.local_path' do
    let(:public_path) { SendFile.send_file(file) }

    it 'obtains the local path of the publicly accessible file' do
      expect(FileUtils.identical?(SendFile.local_path(public_path), file)).to be(true)
    end
  end
end
