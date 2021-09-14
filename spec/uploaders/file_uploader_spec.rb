# frozen_string_literal: true
require 'rails_helper'
require 'carrierwave/test/matchers'

RSpec.describe FileUploader, type: :model do
  include CarrierWave::Test::Matchers

  let(:attachment) { create(:attachment) }

  before do
    @uploader = FileUploader.new(attachment, :file_upload)

    File.open(File.join(Rails.root, '/spec/fixtures/files/text.txt')) do |f|
      @uploader.store!(f)
    end
  end

  it 'uploads the file' do
    expect(File.exist?(@uploader.file.path)).to eq true
  end

  it 'sets the correct permission' do
    expect(@uploader).to have_permissions(0o644)
  end
end
