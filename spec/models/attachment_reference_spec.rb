# frozen_string_literal: true
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

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:attachable) { create(:material) }
    let(:attachment_reference) { attachable.attachment_reference }

    describe '#update_expires_at' do
      subject { attachment_reference.expires_at }

      context 'when attachable is present' do
        it { is_expected.to be_nil }
      end

      context 'when attachable it not present' do
        let(:attachment_reference) { create(:attachment_reference) }

        it { is_expected.to be_present }
      end

      context 'when unset the attachable' do
        before do
          attachment_reference.attachable = nil
          attachment_reference.save!
        end

        it { is_expected.to be_present }
      end
    end
  end
end
