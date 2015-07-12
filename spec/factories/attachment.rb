FactoryGirl.define do
  factory :attachment do
    name 'Attachment'
    file_upload do
      Rack::Test::UploadedFile.new(File.join(Rails.root, '/spec/fixtures/files/text.txt'))
    end
  end
end
