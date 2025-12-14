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

  describe '.send_file_production' do
    let(:s3_client) { Aws::S3::Client.new(stub_responses: true) }
    let(:bucket) { 'test-bucket' }
    let(:time_now) { Time.now }

    before do
      stub_const('S3_CLIENT', s3_client)
      stub_const('SendFile::MULTIPART_CHUNK_SIZE', 100)
      stub_const('SendFile::MIN_MULTIPART_UPLOAD_SIZE', 1000)
      allow(ENV).to receive(:fetch).with('AWS_BUCKET', nil).and_return(bucket)
      allow(Time).to receive(:now).and_return(time_now)
      allow(time_now).to receive(:to_i).and_return(123)
    end

    context 'with a small file' do
      let(:small_file) do
        file = Tempfile.new('small_file')
        file << ('a' * 700)
        file.close
        file.path
      end

      it 'uses single upload' do
        s3_client.stub_responses(:put_object, {})
        s3_client.stub_responses(:get_object, presigned_url: 'https://s3.amazonaws.com/test-bucket/downloads/123/test.txt')

        expect(SendFile).to receive(:s3_single_upload_file).and_call_original
        expect(SendFile).not_to receive(:s3_multipart_upload_file)
        result = SendFile.send_file_production(small_file, 'test.txt')
        expect(result).to be_present
        expect(result).to include('test-bucket')
        expect(result).to include('downloads/123/test.txt')
      end
    end

    context 'with a large file' do
      let(:large_file) do
        file = Tempfile.new('large_file')
        file << ('a' * 1200)
        file.close
        file.path
      end

      it 'uses multipart upload' do
        s3_client.stub_responses(:create_multipart_upload, upload_id: 'test-upload-id')
        s3_client.stub_responses(:upload_part, etag: 'test-etag')
        s3_client.stub_responses(:complete_multipart_upload, {})

        expect(SendFile).not_to receive(:s3_single_upload_file)
        expect(SendFile).to receive(:s3_multipart_upload_file).and_call_original
        result = SendFile.send_file_production(large_file, 'test.txt')
        expect(result).to be_present
        expect(result).to include('test-bucket')
        expect(result).to include('downloads/123/test.txt')
      end

      it 'aborts the upload if an error occurs' do
        s3_client.stub_responses(:create_multipart_upload, upload_id: 'test-upload-id')
        s3_client.stub_responses(:upload_part, 'ServiceError')
        s3_client.stub_responses(:abort_multipart_upload, {})

        expect { SendFile.send_file_production(large_file, 'test.txt') }.to raise_error(Aws::S3::Errors::ServiceError)
      end
    end
  end

  describe '.s3_single_upload_file' do
    let(:s3_client) { Aws::S3::Client.new(stub_responses: true) }
    let(:bucket) { 'test-bucket' }
    let(:s3_key) { 'downloads/123/test.txt' }
    let(:file_handle) { StringIO.new('test content') }

    before do
      stub_const('S3_CLIENT', s3_client)
      allow(ENV).to receive(:fetch).with('AWS_BUCKET', nil).and_return(bucket)
      s3_client.stub_responses(:put_object, {})
    end

    it 'uploads the file using put_object' do
      SendFile.s3_single_upload_file(file_handle, s3_key)

      expect(s3_client.api_requests.size).to eq(1)
      request = s3_client.api_requests.first
      expect(request[:operation_name]).to eq(:put_object)
      expect(request[:params][:bucket]).to eq(bucket)
      expect(request[:params][:key]).to eq(s3_key)
    end
  end

  describe '.s3_multipart_upload_file' do
    let(:s3_client) { Aws::S3::Client.new(stub_responses: true) }
    let(:bucket) { 'test-bucket' }
    let(:s3_key) { 'downloads/123/test.txt' }
    let(:upload_id) { 'test-upload-id' }
    let(:file_content) { 'a' * 250 }
    let(:file_handle) { StringIO.new(file_content) }

    before do
      stub_const('S3_CLIENT', s3_client)
      stub_const('SendFile::MULTIPART_CHUNK_SIZE', 100)
      allow(ENV).to receive(:fetch).with('AWS_BUCKET', nil).and_return(bucket)
      s3_client.stub_responses(:create_multipart_upload, upload_id: upload_id)
      s3_client.stub_responses(:upload_part, [
                                 { etag: 'etag-1' },
                                 { etag: 'etag-2' },
                                 { etag: 'etag-3' }
                               ])
      s3_client.stub_responses(:complete_multipart_upload, {})
    end

    it 'creates a multipart upload' do
      SendFile.s3_multipart_upload_file(file_handle, s3_key)

      create_request = s3_client.api_requests.find { |r| r[:operation_name] == :create_multipart_upload }
      expect(create_request).to be_present
      expect(create_request[:params][:bucket]).to eq(bucket)
      expect(create_request[:params][:key]).to eq(s3_key)
    end

    it 'uploads file in chunks' do
      SendFile.s3_multipart_upload_file(file_handle, s3_key)

      upload_requests = s3_client.api_requests.select { |r| r[:operation_name] == :upload_part }
      expect(upload_requests.size).to eq(3)
      expect(upload_requests[0][:params][:part_number]).to eq(1)
      expect(upload_requests[1][:params][:part_number]).to eq(2)
      expect(upload_requests[2][:params][:part_number]).to eq(3)
    end

    it 'completes the multipart upload with all parts' do
      SendFile.s3_multipart_upload_file(file_handle, s3_key)

      complete_request = s3_client.api_requests.find { |r| r[:operation_name] == :complete_multipart_upload }
      expect(complete_request).to be_present
      expect(complete_request[:params][:bucket]).to eq(bucket)
      expect(complete_request[:params][:key]).to eq(s3_key)
      expect(complete_request[:params][:upload_id]).to eq(upload_id)
      expect(complete_request[:params][:multipart_upload][:parts]).to eq(
        [
          { etag: 'etag-1', part_number: 1 },
          { etag: 'etag-2', part_number: 2 },
          { etag: 'etag-3', part_number: 3 }
        ]
      )
    end

    it 'aborts the upload if an error occurs before completion' do
      s3_client.stub_responses(:upload_part, 'ServiceError')
      s3_client.stub_responses(:abort_multipart_upload, {})

      expect { SendFile.s3_multipart_upload_file(file_handle, s3_key) }.to raise_error(Aws::S3::Errors::ServiceError)

      abort_request = s3_client.api_requests.find { |r| r[:operation_name] == :abort_multipart_upload }
      expect(abort_request).to be_present
      expect(abort_request[:params][:bucket]).to eq(bucket)
      expect(abort_request[:params][:key]).to eq(s3_key)
      expect(abort_request[:params][:upload_id]).to eq(upload_id)
    end

    it 'does not abort if upload completes successfully' do
      SendFile.s3_multipart_upload_file(file_handle, s3_key)

      abort_request = s3_client.api_requests.find { |r| r[:operation_name] == :abort_multipart_upload }
      expect(abort_request).to be_nil
    end
  end
end
