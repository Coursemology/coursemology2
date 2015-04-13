require 'carrierwave/test/matchers'

RSpec.describe ImageUploader, type: :model do
  include CarrierWave::Test::Matchers
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    before do
      ImageUploader.enable_processing = true
      @uploader = ImageUploader.new(course, :logo)

      File.open(File.join(Rails.root, '/spec/fixtures/files/picture.jpg')) do |f|
        @uploader.store!(f)
      end
    end

    after do
      ImageUploader.enable_processing = false
      @uploader.remove!
    end

    context 'the thumb version' do
      it 'scales down a landscape image to be exactly 64 by 64 pixels' do
        expect(@uploader.thumb).to have_dimensions(50, 50)
      end
    end

    context 'the small version' do
      it 'scales down a landscape image to be exactly 100 by 100 pixels' do
        expect(@uploader.small).to have_dimensions(100, 100)
      end
    end

    context 'the medium version' do
      it 'scales down a landscape image to be exactly 200 by 200 pixels' do
        expect(@uploader.medium).to have_dimensions(200, 200)
      end
    end
  end
end
