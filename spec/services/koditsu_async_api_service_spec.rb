# frozen_string_literal: true
require 'rails_helper'

# The Koditsu URLs and API key come from the `koditsu` section of Rails credentials; the test credentials hold the
# placeholder values used here. The environment variables they replaced may linger on servers, so they are set to
# other values throughout to show they are ignored.
RSpec.describe KoditsuAsyncApiService do
  around do |example|
    leftovers = { 'KODITSU_API_URL' => 'http://localhost:1', 'KODITSU_API_KEY' => 'stale-key',
                  'KODITSU_WEB_URL' => 'http://localhost:2' }
    previous = leftovers.keys.index_with { |name| ENV.fetch(name, nil) }
    leftovers.each { |name, value| ENV[name] = value }
    example.run
  ensure
    previous.each { |name, value| ENV[name] = value }
  end

  describe 'requests' do
    around do |example|
      mock = Excon.defaults[:mock]
      Excon.defaults[:mock] = true
      example.run
    ensure
      Excon.stubs.clear
      Excon.defaults[:mock] = mock
    end

    before do
      Excon.stub({ method: :post, host: 'localhost', port: 53_898, path: '/api/workspace',
                   headers: { 'x-api-key' => 'REDACTED' } },
                 { status: 201, body: { data: { id: 'workspace-id' } }.to_json })
    end

    it 'calls the API URL with the API key from credentials' do
      status, body = described_class.new('api/workspace', { name: 'Course' }).post

      expect(status).to eq(201)
      expect(body).to eq('data' => { 'id' => 'workspace-id' })
    end
  end

  describe '.assessment_url' do
    it 'links to the assessment on the web URL from credentials' do
      expect(described_class.assessment_url('assessment-id')).to eq('http://localhost:53899?assessment=assessment-id')
    end
  end
end
