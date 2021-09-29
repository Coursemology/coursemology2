# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Jobs: status query' do
  context 'As a user' do
    let(:job) { create(:trackable_job) }

    scenario 'I can query the status of a job' do
      visit job_path(job.id)
      expect(page).to have_selector('.fa-spinner.fa-spin')
      expect(page).to have_selector(:xpath, '/html/head/meta[@http-equiv="refresh"][@content="5"]',
                                    visible: false)

      redirect_path = '/'
      job.update(status: 'completed', redirect_to: redirect_path)
      visit job_path(job.id)
      expect(current_path).to eq(redirect_path)

      job.update(status: 'errored', redirect_to: nil)
      visit job_path(job.id)
      expect(page).to have_selector('div.alert-danger')

      job.update(status: 'errored', redirect_to: redirect_path)
      visit job_path(job.id)
      expect(current_path).to eq(redirect_path)
    end
  end
end
