require 'rails_helper'
require 'carrierwave/test/matchers'

RSpec.describe ImageUploader, type: :model do
  include CarrierWave::Test::Matchers
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:uploader) { ImageUploader.new(course, :logo) }

    before do
      ImageUploader.enable_processing = true

      File.open(File.join(Rails.root, '/spec/fixtures/files/picture.jpg'), 'rb') do |f|
        uploader.store!(f)
      end
    end

    after do
      ImageUploader.enable_processing = false
      uploader.remove!
    end

    context 'the thumb version' do
      it 'scales down a landscape image to be exactly 64 by 64 pixels' do
        expect(uploader.thumb).to have_dimensions(50, 50)
      end
    end

    context 'the small version' do
      it 'scales down a landscape image to be exactly 100 by 100 pixels' do
        expect(uploader.small).to have_dimensions(100, 100)
      end
    end

    context 'the medium version' do
      it 'scales down a landscape image to be exactly 200 by 200 pixels' do
        expect(uploader.medium).to have_dimensions(200, 200)
      end
    end

    context 'when the image format is invalid' do
      it 'raises an error' do
        file = File.open(File.join(Rails.root, '/spec/fixtures/files/text.txt'), 'rb')
        expect { uploader.store!(file) }.to raise_error(CarrierWave::IntegrityError)
        file.close
      end
    end
  end
end
