# frozen_string_literal: true
require 'rails_helper'

RSpec.describe AttachmentReferencesController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    before { controller_sign_in(controller, user) }

    describe '#create' do
      render_views
      let(:file) { fixture_file_upload('files/picture.jpg', 'image/jpeg') }
      let(:filename) { 'Foo' }
      let(:json) { JSON.parse(response.body) }
      subject { post :create, format: :json, params: { file: file, name: filename } }
      before { subject }

      context 'when file is not specified or invalid' do
        subject { post :create, format: :json, params: { name: filename } }

        it 'returns success: false in the response' do
          expect(json['success']).to be_falsey
        end
      end

      context 'when file is valid' do
        it 'returns success: true in the response' do
          expect(json['success']).to be_truthy
        end

        it 'returns the url of the attachment and id of the attachment_reference' do
          expect(json['id']).to be_truthy
        end
      end
    end

    describe '#show -' do
      def attachment_with_name(name)
        create(:attachment_reference, name: name)
      end

      describe 'local storage' do
        let(:attachment_reference) { attachment_with_name('report.txt') }

        before do
          allow(FileUploader).to receive(:storage).and_return(CarrierWave::Storage::File)
          get :show, params: { id: attachment_reference }
        end

        it 'returns 200 when successful' do
          expect(response).to have_http_status(:ok)
        end

        it 'sets correct Content-Disposition filename' do
          disposition = response.headers['Content-Disposition']

          expect(disposition).to include('report.txt')
          expect(disposition).not_to include(attachment_reference.attachment.name)
        end
      end

      describe 'remote storage' do
        let(:attachment_reference) { attachment_with_name('report.txt') }

        let(:fake_uploader) { double('FakeUploader') }

        before do
          expected_remote_url = attachment_reference.url(filename: attachment_reference.name)

          remote_storage = double(storage: CarrierWave::Storage::Fog)

          allow(fake_uploader).to receive(:class).and_return(remote_storage)
          allow(fake_uploader).to receive(:url).and_return(expected_remote_url)
          allow_any_instance_of(Attachment).to receive(:file_upload).and_return(fake_uploader)

          get :show, params: { id: attachment_reference }
        end

        it 'redirects to remote storage' do
          expect(response).to be_redirect
        end

        it 'redirects with correct filename' do
          expect(fake_uploader).to have_received(:url).with(filename: 'report.txt')
        end
      end

      describe 'filename edge cases' do # edge cases
        def expect_filename_in_disposition(name)
          get :show, params: { id: attachment_with_name(name) }
          disposition = response.headers['Content-Disposition'].to_s

          decoded = URI.decode_www_form_component(disposition)

          expect(decoded).to include(name)
        end

        it 'preserves spaces' do
          expect_filename_in_disposition('This Is a Test File.pdf')
        end

        it 'preserves hyphens and underscores' do
          expect_filename_in_disposition('EBSCO-FullText-05_06_2026.pdf')
        end

        it 'preserves parentheses' do
          expect_filename_in_disposition('report (2024).txt')
        end

        it 'preserves symbols' do
          expect_filename_in_disposition('@!#$%^*&;:.txt')
        end

        it 'preserves non-ASCII characters when decoded' do
          expect_filename_in_disposition('报告.txt')
        end
      end

      describe 'invalid files:' do
        let(:attachment) { attachment_with_name('missing.txt') }

        before do
          uploader = instance_double(FileUploader)
          file_double = instance_double('file', exists?: false)

          allow_any_instance_of(Attachment).to receive(:file_upload).and_return(uploader)
          allow(uploader).to receive(:file).and_return(file_double)
          allow(uploader).to receive(:path).and_return('/tmp/missing_file')
          allow(uploader).to receive_message_chain(:class, :storage).and_return(CarrierWave::Storage::File)
        end

        it 'raises RecordNotFound when file is missing' do
          expect do
            get :show, params: { id: attachment.id }
          end.to raise_error(ActiveRecord::RecordNotFound)
        end

        it 'raises RecordNotFound for non-existent record' do
          expect do
            get :show, params: { id: 'nonexistent-uuid' }
          end.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end
end
