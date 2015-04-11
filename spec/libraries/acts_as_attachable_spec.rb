require 'rails_helper'

RSpec.describe 'ActsAsAttachable' do
  class SampleModel < ActiveRecord::Base
    def self.columns
      []
    end

    acts_as_attachable
  end

  describe SampleModel do
    it { is_expected.to have_many(:attachments) }
  end

  describe 'controller' do
    class SampleController < ActionController::Base; end

    context 'class methods' do
      subject { SampleController }

      it { is_expected.to respond_to(:accepts_attachments) }
    end

    context 'instance methods' do
      subject { SampleController.new }

      it { is_expected.to respond_to(:attachments_params) }
    end
  end

  describe 'form_builder helper' do
    class SampleView < ActionView::Base; end
    class SampleFormBuilder < ActionView::Helpers::FormBuilder; end

    let(:template) { SampleView.new(Rails.root.join('app', 'views')) }
    let(:resource) do
      model = SampleModel.new
      model.attachments << build(:attachment)
      model
    end
    let(:form_builder) { SampleFormBuilder.new(:sample, resource, template, {}) }
    subject { form_builder }

    it { is_expected.to respond_to(:attachments) }

    describe '#attachments' do
      before { I18n.locale = I18n.default_locale }
      subject { form_builder.attachments }

      it { is_expected.to have_tag('div', text: 'Upload new file') }
    end
  end
end
