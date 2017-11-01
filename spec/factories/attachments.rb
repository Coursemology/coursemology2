# frozen_string_literal: true
FactoryBot.define do
  factory :attachment do
    name { SecureRandom.hex(32) }

    transient do
      binary false
      content_type 'text/plain'
      file { File.join(Rails.root, '/spec/fixtures/files/text.txt') }
    end

    file_upload do
      Rack::Test::UploadedFile.new(file, content_type, binary)
    end
  end
end
