require 'rails_helper'

RSpec.describe Course::Material::ZipDownloadJob do
  let(:instance) { create(:instance) }
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

    describe '#publish_file' do
      let(:file) do
        file = Tempfile.new('test_file')
        file.close
        file.path
      end
      let(:filename) { 'Name with whitespaces' }
      let(:download_job) { Course::Material::ZipDownloadJob.perform_later(folder, []) }
      subject { download_job.send(:publish_file, file, filename) }

      it { is_expected.to eq(URI.encode("/downloads/#{download_job.job.id}/#{filename}")) }
    end
  end
end
