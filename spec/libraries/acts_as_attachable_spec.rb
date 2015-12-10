require 'rails_helper'

RSpec.describe 'Extension: Acts as Attachable' do
  class self::SampleModelMultiple < ActiveRecord::Base
    def self.columns
      []
    end

    has_many_attachments
  end

  class self::SampleModelSingular < ActiveRecord::Base
    def self.columns
      []
    end

    has_one_attachment
  end

  describe self::SampleModelMultiple, type: :model do
    it { is_expected.to have_many(:attachments) }

    let(:files) { [File.open(File.join(Rails.root, '/spec/fixtures/files/text.txt'))] }
    let(:attachable) { self.class::SampleModelMultiple.new }

    describe '#files=' do
      it 'creates attachments from files' do
        attachable.files = files
        expect(attachable.attachments).to be_present
      end
    end
  end

  describe self::SampleModelSingular do
    it { is_expected.to respond_to(:attachment) }

    let(:file) { File.open(File.join(Rails.root, '/spec/fixtures/files/text.txt')) }
    let(:attachable) { self.class::SampleModelSingular.new }

    describe '#attachment_changed?' do
      context 'when the record is clean' do
        it 'returns false' do
          expect(attachable.attachment_changed?).to be(false)
        end
      end
    end

    describe '#file=' do
      before { attachable.file = file }
      it 'creates an attachment from file' do
        expect(attachable.attachment).to be_present
      end

      it 'marks attachment as modified' do
        expect(attachable.attachment_changed?).to be(true)
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
    end
    class self::SampleFormBuilder < ActionView::Helpers::FormBuilder; end

    let(:template) { self.class::SampleView.new(Rails.root.join('app', 'views')) }
    let(:resource) do
      model = self.class::SampleModelMultiple.new
      model.attachments << build(:attachment)
      model
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
          model.attachment = build(:attachment)
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
