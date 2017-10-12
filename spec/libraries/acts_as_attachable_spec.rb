# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Attachable' do
  class self::SampleModelMultiple < ApplicationRecord
    def self.columns
      []
    end

    has_many_attachments
  end

  class self::SampleModelSingular < ApplicationRecord
    def self.columns
      []
    end

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

    describe '#parse_attachment_reference_id_from_url' do
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
            url = "/attachments/#{uuid}"
            expect(attachable.send(:parse_attachment_reference_id_from_url, url)).to eq(uuid)
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
            url = "/attachments/#{uuid}"
            expect(attachable.send(:parse_attachment_reference_id_from_url, url)).to be_nil
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
          expect(attachable.changes[:attachment].first).to be_nil
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
          expect(attachable.changes[:attachment].first).to be_nil
        end
      end

      context 'when nil is specified' do
        context 'when a file existed' do
          before do
            attachable.file = file
            attachable.clear_attribute_changes
            attachable.file = nil
          end

          it 'removes the attachment' do
            expect(attachable.attachment).to be_nil
          end

          it 'marks attachment as modified' do
            expect(attachable.attachment_changed?).to be(true)
          end

          it 'stores the old attribute' do
            expect(attachable.changes[:attachment].first).to be_a(AttachmentReference)
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

  describe 'form_builder helper' do
    class self::SampleView < ActionView::Base
      include ApplicationFormattersHelper
      include Rails.application.routes.url_helpers
    end
    class self::SampleFormBuilder < ActionView::Helpers::FormBuilder; end

    let(:attachment) { create(:attachment_reference) }
    let(:template) { self.class::SampleView.new(Rails.root.join('app', 'views')) }
    let(:resource) do
      stub = self.class::SampleModelMultiple.new
      allow(stub).to receive(:attachments).and_return([attachment])
      stub
    end
    let(:form_builder) { self.class::SampleFormBuilder.new(:sample, resource, template, {}) }
    subject { form_builder }

    it { is_expected.to respond_to(:attachments) }

    describe '#attachments' do
      before { I18n.locale = I18n.default_locale }
      subject { form_builder.attachments }

      context 'when has many attachments' do
        it do
          is_expected.
            to have_tag('strong', text: I18n.t('layouts.attachment_uploader.uploaded_files'))
        end
      end

      context 'when has one attachment' do
        let(:resource) do
          model = self.class::SampleModelSingular.new
          model.attachment = attachment
          model
        end
        it do
          is_expected.
            to have_tag('strong', text: I18n.t('layouts.attachment_uploader.uploaded_file'))
        end
      end
    end
  end
end
