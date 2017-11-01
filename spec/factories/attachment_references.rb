# frozen_string_literal: true
FactoryBot.define do
  factory :attachment_reference do
    transient do
      binary false
      content_type 'text/plain'
      file_path { File.join(Rails.root, '/spec/fixtures/files/text.txt') }
    end

    file do
      Rack::Test::UploadedFile.new(file_path, content_type, binary)
    end
  end
end
