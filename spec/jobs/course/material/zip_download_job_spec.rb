# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Material::ZipDownloadJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:folder) { create(:material).folder }
    subject { Course::Material::ZipDownloadJob }

    it 'can be queued' do
      expect { subject.perform_later(folder, []) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'downloads the materials' do
      download_job = subject.perform_later(folder, folder.materials.to_a)
      download_job.perform_now
      expect(download_job.job).to be_completed
      expect(download_job.job.redirect_to).to be_present
    end
  end
end
