require 'rails_helper'

RSpec.describe Course::Material::ZipDownloadJob do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:folder) { create(:folder) }
    subject { Course::Material::ZipDownloadJob }

    it 'can be queued' do
      expect { subject.perform_later(folder, []) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    it 'downloads the contents' do
      pending 'Download folders/files'
      download_job = subject.perform_later(folder, [])
      download_job.perform_now
      expect(download_job.job).to be_completed
      expect(download_job.job.redirect_to).to be_present
    end
  end
end
