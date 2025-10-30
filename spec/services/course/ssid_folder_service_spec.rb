# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::SsidFolderService do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:folder_name) { 'Test Folder' }
    let(:parent_folder_id) { nil }

    subject { described_class.new(folder_name, parent_folder_id) }

    let(:stubs) { Faraday::Adapter::Test::Stubs.new }
    let(:connection) do
      Faraday.new(url: 'http://localhost:53897') do |builder|
        builder.adapter :test, stubs
      end
    end

    before do
      allow_any_instance_of(SsidAsyncApiService).to receive(:connection).and_return(connection)
    end

    after do
      stubs.verify_stubbed_calls
    end

    describe '#run_create_ssid_folder_service' do
      before do
        stubs.post('/folders') do |env|
          expect(env[:body]).to eq({ name: folder_name, parentId: parent_folder_id }.to_json)
          [Ssid::ApiStubs::CREATE_FOLDER_SUCCESS[:status],
           { 'Content-Type': 'application/json' },
           Ssid::ApiStubs::CREATE_FOLDER_SUCCESS[:body]]
        end
      end
      it 'creates a folder successfully and returns folder data' do
        result = subject.run_create_ssid_folder_service

        expect(result).to eq('185ek301-eecb-44ce-838e-bf1234f990e1')
      end
    end
  end
end
