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
      let(:controller) { SampleController.new }
      subject { controller }
      it { is_expected.to respond_to(:attachments_params) }

      describe '#attachments_params' do
        it 'returns the permitted params' do
          expect(subject.attachments_params[:attachments_attributes]).not_to be_nil
        end
      end

      describe '#build_attachments' do
        before do
          allow(controller).to receive(:params).and_return(controller: 'sample_model')
          controller.instance_eval do
            @sample_model = SampleModel.new
            build_attachments
          end
        end

        it 'builds the attachments' do
          expect(controller.instance_variable_get('@sample_model').attachments).not_to be_empty
        end
      end
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
