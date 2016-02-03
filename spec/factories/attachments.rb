# frozen_string_literal: true
FactoryGirl.define do
  factory :attachment do
    transient do
      binary false
      content_type 'text/plain'
      file { File.join(Rails.root, '/spec/fixtures/files/text.txt') }
    end

    name 'Attachment'
    file_upload do
      Rack::Test::UploadedFile.new(file, content_type, binary)
    end
  end
end
