require 'rails_helper'

RSpec.describe 'Extension: Materials' do
  class self::Assessment < ActiveRecord::Base
    def self.columns
      []
    end

    has_one_folder
  end

  describe self::Assessment, type: :model do
    it { is_expected.to have_one(:folder).autosave(true) }
    it { is_expected.to have_many(:materials) }

    let(:files) { [OpenStruct.new(original_filename: 'file.txt')] }
    let(:assessment) { self.class::Assessment.new }
    describe '#files_attributes=' do
      before do
        assessment.build_folder(name: 'folder')
      end

      it 'creates materials from files' do
        assessment.files_attributes = files
        expect(assessment.folder.materials).to be_present
      end

      context 'when filename is not valid' do
        let(:files) { [OpenStruct.new(original_filename: 'lol\lol.txt')] }

        it 'normalizes the name' do
          assessment.files_attributes = files
          expect(assessment.folder.materials.first.name).to eq('lol lol.txt')
        end
      end
    end
  end

  describe 'controller' do
    class self::AssessmentsController < ActionController::Base; end

    let(:controller) { self.class::AssessmentsController.new }
    subject { controller }
    it { is_expected.to respond_to(:folder_params) }

    describe '#folder_params' do
      it 'returns the permitted params' do
        expect(subject.folder_params).to include(:files_attributes)
      end
    end
  end

  describe 'form_builder helper' do
    class self::AssessmentView < ActionView::Base; end
    class self::FormBuilder < ActionView::Helpers::FormBuilder; end

    let(:template) { self.class::AssessmentView.new(Rails.root.join('app', 'views')) }
    let(:resource) do
      assessment = self.class::Assessment.new
      assessment.build_folder
      assessment
    end
    let(:form_builder) { self.class::FormBuilder.new(:form_builder, resource, template, {}) }
    subject { form_builder }

    it { is_expected.to respond_to(:folder) }

    describe '#folder' do
      subject { form_builder.folder }

      it do
        is_expected.
          to have_tag('strong', text: I18n.t('layouts.materials_uploader.new_materials'))
      end
    end
  end
end
