FactoryGirl.define do
  factory :attachment do
    transient do
      file { File.join(Rails.root, '/spec/fixtures/files/text.txt') }
    end

    name 'Attachment'
    file_upload do
      Rack::Test::UploadedFile.new(file)
    end
  end
end
