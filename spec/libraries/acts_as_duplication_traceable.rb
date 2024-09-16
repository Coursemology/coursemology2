# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Duplication Traceable', type: :model do
  class self::DummyDuplicationTraceableClass < ApplicationRecord
    def self.columns
      []
    end

    def self.load_schema!; end

    def self._default_attributes
      ActiveModel::AttributeSet.new({})
    end

    acts_as_duplication_traceable
  end

  describe 'classes which implement acts_as_duplication_traceable' do
    subject { self.class::DummyDuplicationTraceableClass }

    it 'implements .dependent_class' do
      expect(subject).to respond_to(:dependent_class)
      expect { subject.dependent_class }.to raise_error(NotImplementedError)
    end

    it 'implements .initialize_with_dest' do
      expect(subject).to respond_to(:initialize_with_dest)
      expect { subject.initialize_with_dest(double) }.to raise_error(NotImplementedError)
    end
  end

  class self::ComplexDuplicationTraceableClass < ApplicationRecord
    def self.columns
      []
    end

    def self.load_schema!; end

    def self._default_attributes
      ActiveModel::AttributeSet.new({})
    end

    acts_as_duplication_traceable

    def self.dependent_class
      Course.name
    end
  end

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    describe 'objects which act as duplication traceables' do
      subject { self.class::ComplexDuplicationTraceableClass.new }
      let(:course) { create(:course) }

      it 'implements #source' do
        expect(subject).to respond_to(:source)
        expect(subject.source).to be(nil)
      end

      it 'implements #source=' do
        expect(subject).to respond_to(:source=)
        subject.source = course
        expect(subject.source).to eq(course)
      end

      describe 'validations' do
        it 'checks that the source exists' do
          subject.source_id = -1
          expect(subject).to_not be_valid
          expect(subject.errors[:source_id]).to include(I18n.t('activerecord.errors.models.duplication_traceable.' \
                                                               'attributes.source_id.must_exist'))
        end
      end
    end
  end
end
