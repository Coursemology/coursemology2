require 'rails_helper'

RSpec.describe Course::Material::ZipDownloadService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#download' do
      let(:folder) { create(:folder) }
      subject { Course::Material::ZipDownloadService.download_and_zip(folder, []) }

      it 'downloads the contents' do
        pending 'To be implemented'

        expect(subject).to be_present
      end
    end
  end
end
