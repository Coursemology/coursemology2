require 'rails_helper'

RSpec.describe AttachmentReference do
  it { is_expected.to belong_to(:attachable) }
  it { is_expected.to belong_to(:attachment) }

  describe '#file=' do
    let(:file1) do
      Rack::Test::UploadedFile.new(File.join(Rails.root, '/spec/fixtures/files/text.txt'))
    end
    let(:file2) do
      Rack::Test::UploadedFile.new(File.join(Rails.root, '/spec/fixtures/files/picture.jpg'),
                                   'image/jpeg')
    end

    context 'when an existing file is given' do
      it 'links to the existing attachment' do
        existing_attachment = create(:attachment_reference, file: file1).attachment
        new_attachment = create(:attachment_reference, file: file1).attachment

        expect(existing_attachment).to eq(new_attachment)
      end
    end

    context 'when a new file is given' do
      it 'creates a new attachment' do
        existing_attachment = create(:attachment_reference, file: file1).attachment
        new_attachment = create(:attachment_reference, file: file2).attachment

        expect(existing_attachment).not_to eq(new_attachment)
      end
    end
  end
end
