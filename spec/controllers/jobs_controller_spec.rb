# frozen_string_literal: true
require 'rails_helper'

RSpec.describe JobsController do
  let(:job) { create(:trackable_job, *job_traits) }
  let(:job_traits) { nil }
  let(:format) { :html }
  before do
    controller.instance_variable_set(:@job, job)
  end

  describe '#show' do
    def self.expect_to_redirect_to_job_redirect_to
      let(:redirect_path) { '/' }
      let(:job_traits) do
        super_traits = *super()
        super_traits + [{ redirect_to: redirect_path }]
      end
      it { is_expected.to redirect_to(redirect_path) }
    end

    before { get 'show', id: job.id, format: format }

    context 'when the job is in progress' do
      it { is_expected.to respond_with(:accepted) }
    end

    context 'when the job has been completed' do
      let(:job_traits) { :completed }
      context 'when the job has a redirect_to path' do
        expect_to_redirect_to_job_redirect_to
      end
    end

    context 'when the job has errored' do
      let(:job_traits) { :errored }
      context 'when the job has a redirect_to path' do
        expect_to_redirect_to_job_redirect_to
      end

      context 'when the job does not have a redirect_to path' do
        it { is_expected.to respond_with(:ok) }
      end

      context 'when the requested format is json' do
        render_views
        let(:format) { :json }
        let(:json_response) { JSON.parse(response.body) }

        it 'responses with an errored job status' do
          expect(response.status).to be(200)
          expect(json_response['status']).to eq('errored')
        end
      end
    end
  end
end
