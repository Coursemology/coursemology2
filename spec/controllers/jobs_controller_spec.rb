require 'rails_helper'

RSpec.describe JobsController do
  let(:job) { create(:trackable_job, *job_traits) }
  let(:job_traits) { nil }
  before do
    controller.instance_variable_set(:@job, job)
  end

  describe '#show' do
    def self.expect_to_redirect_to_job_redirect_to
      before { job.redirect_to = '/' }
      it { is_expected.to redirect_to(job.redirect_to) }
    end

    subject { get 'show', id: job.id }

    context 'when the job has been completed' do
      context 'when the job has a redirect_to path' do
        let(:job_traits) { :completed }
        expect_to_redirect_to_job_redirect_to
      end
    end

    context 'when the job has errored' do
      context 'when the job has a redirect_to path' do
        let(:job_traits) { :errored }
        expect_to_redirect_to_job_redirect_to
      end
    end
  end
end
