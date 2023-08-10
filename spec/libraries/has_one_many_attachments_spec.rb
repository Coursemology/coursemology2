# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Attachable' do
  class self::SampleModelMultiple < ApplicationRecord
    def self.columns
      []
    end

    def self.load_schema!; end

    has_many_attachments
  end

  class self::SampleModelSingular < ApplicationRecord
    def self.columns
      []
    end

    def self.load_schema!; end

    has_one_attachment

    def clear_attribute_changes(attributes = changed_attributes.keys)
      super
    end
    public :clear_attribute_changes
  end

  describe self::SampleModelMultiple, type: :model do
    it { is_expected.to respond_to(:attachment_references) }
    it { is_expected.to respond_to(:attachments) }

    let(:files) { [File.open(File.join(Rails.root, '/spec/fixtures/files/text.txt'))] }
    let(:attachable) { self.class::SampleModelMultiple.new }

    describe '#files=' do
      it 'creates attachments from files' do
        attachable.files = files
        expect(attachable.attachments).to be_present
      end
    end

    describe '#parse_attachment_reference_uuid_from_url' do
      let(:url_prefix) { '/attachments/' }

      context 'with valid UUIDs' do
        let(:uuids) do
          [
            'f24cfa8b-b9c7-4b16-9cdf-ec6e0f84511d',
            '24449936-6bfa-4407-a7f2-8c7a360c3316',
            '04ecba9a-c53c-487b-9191-22454be2b407'
          ]
        end

        it 'returns the uuid' do
          uuids.each do |uuid|
            url = url_prefix + uuid
            expect(attachable.send(:parse_attachment_reference_uuid_from_url, url)).to eq(uuid)
          end
        end
      end

      context 'with invalid UUIDs' do
        let(:uuids) do
          [
            'f24cfa8b-b9c7-4b16-9cdf-',
            'c53c-487b-9191-22454be2b407',
            '24449936-6bfa-4407-8c7a360c3316',
            '04ecba9a_c53c_487b_9191_22454be2b407'
          ]
        end
        it 'returns nil' do
          uuids.each do |uuid|
            url = url_prefix + uuid
            expect(attachable.send(:parse_attachment_reference_uuid_from_url, url)).to be_nil
          end
        end
      end
    end
  end

  describe self::SampleModelSingular do
    it { is_expected.to respond_to(:attachment) }

    let(:file) { File.open(File.join(Rails.root, '/spec/fixtures/files/text.txt')) }
    let(:attachable) { self.class::SampleModelSingular.new }

    describe '#attachment=' do
      context 'when the same attachment is specified' do
        before { attachable.attachment = attachable.attachment }

        it 'does not change the attachment' do
          expect(attachable.attachment_changed?).to be(false)
        end
      end

      context 'when a new attachment is specified' do
        let(:attachment) { build(:attachment_reference, file: file) }
        before { attachable.attachment = attachment }

        it 'stores the old attribute' do
          expect(attachable.instance_variable_get(:@original_attachment)).to be_nil
        end
      end
    end

    describe '#build_attachment' do
      let(:attachment_attributes) { {} }
      before { attachable.build_attachment(attachment_attributes) }

      it 'builds a new attachment' do
        expect(attachable.attachment_changed?).to be(true)
      end
    end

    describe '#attachment_changed?' do
      context 'when the record is clean' do
        it 'returns false' do
          expect(attachable.attachment_changed?).to be(false)
        end
      end
    end

    describe '#file=' do
      context 'when a file is specified' do
        before { attachable.file = file }
        it 'creates an attachment from file' do
          expect(attachable.attachment).to be_present
        end

        it 'marks attachment as modified' do
          expect(attachable.attachment_changed?).to be(true)
        end

        it 'stores the old attribute' do
          expect(attachable.instance_variable_get(:@original_attachment)).to be_nil
        end
      end

      context 'when nil is specified' do
        context 'when a file existed' do
          before do
            attachable.file = file
            attachable.clear_attachment_change
            attachable.file = nil
          end

          it 'removes the attachment' do
            expect(attachable.attachment).to be_nil
          end

          it 'marks attachment as modified' do
            expect(attachable.attachment_changed?).to be(true)
          end

          it 'stores the old attribute' do
            expect(attachable.instance_variable_get(:@original_attachment)).to be_a(AttachmentReference)
          end
        end

        context 'when a file was never specified' do
          before { attachable.file = nil }
          it 'does not have an attachment' do
            expect(attachable.attachment).to be_nil
          end

          it 'does not change the attachment' do
            expect(attachable.attachment_changed?).to be(false)
          end
        end
      end
    end
  end

  describe '#has_many_attachments declaration' do
    let(:instance) { Instance.default }
    with_tenant(:instance) do
      def create_image_tag(id)
        "<img src='/attachments/#{id}'>"
      end

      # Use announcement as attachable since this has been declared:
      #   has_many_attachments on: :content
      let!(:attachable) { create(:course_announcement, content: content) }
      let(:attachment_reference) { create(:attachment_reference) }
      let(:content) { "<p>foo #{create_image_tag(attachment_reference.id)}</p>" }

      describe '#column-name_to_email' do
        it 'converts the src of the image tag to a url' do
          parsed = Nokogiri::HTML(attachable.content_to_email)
          parsed.css('img').each do |image|
            expect(image['src']).not_to eq("/attachments/#{attachment_reference.id}")
          end
        end
      end

      context 'when column has attachments in its column' do
        describe 'column_attachment_reference_ids' do
          subject { attachable.content_attachment_reference_ids }

          it { is_expected.to contain_exactly(attachment_reference.id) }
        end
      end

      context 'when img tag without src is present' do
        let(:content) { '<p><img></p>' }

        subject { attachable.content_attachment_reference_ids }

        it { is_expected.to be_empty }
      end

      context 'when column has changes in attachments in its column' do
        let(:new_attachment_reference) { create(:attachment_reference) }
        let(:new_content) { "<p>foo #{create_image_tag(new_attachment_reference.id)}</p>" }
        before { attachable.content = new_content }

        it 'updates the attachment_references correctly when saved' do
          attachable.save
          expect(AttachmentReference.exists?(attachment_reference.id)).to be_falsey
          expect(new_attachment_reference.reload.attachable).to eq(attachable)
        end

        describe '#column_attachment_references_change' do
          subject { attachable.content_attachment_references_change }

          it 'returns the right values' do
            ans = [[attachment_reference.id], [new_attachment_reference.id]]
            expect(subject).to eq ans
          end
        end

        context 'when the provided attachment_reference uuid references a different attachable' do
          let(:other_file) do
            Rack::Test::UploadedFile.new(
              Rails.root.join('spec', 'fixtures', 'files', 'picture.jpg'), 'image/jpeg'
            )
          end
          let(:other_attachable) { create(:course_announcement) }
          let(:other_attachment_reference) { create(:attachment_reference, file: other_file) }
          let(:other_content) { "<p>foo #{create_image_tag(other_attachment_reference.id)}</p>" }

          before do
            other_attachable.content = other_content
            other_attachable.save
            attachable.content = other_content
          end

          it 'creates a new attachment_reference and saves it when attachable is saved' do
            attachable.save

            expect(other_attachment_reference.reload.attachable).to eq(other_attachable)
            expect(attachable.attachments.first.attachment).
              to eq(other_attachment_reference.attachment)
          end
        end
      end
    end
  end

  describe 'controller' do
    class self::SampleController < ActionController::Base; end

    context 'instance methods' do
      let(:controller) { self.class::SampleController.new }
      subject { controller }
      it { is_expected.to respond_to(:attachments_params) }

      describe '#attachments_params' do
        it 'returns the permitted params' do
          expect(subject.attachments_params).to include(:file)
        end
      end
    end
  end
end
