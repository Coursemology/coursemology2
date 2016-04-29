# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Duplicable' do
  class self::SampleModelDuplicable < ActiveRecord::Base
    def self.columns
      []
    end

    acts_as_duplicable
  end

  describe self::SampleModelDuplicable, type: :model do
    it { is_expected.to respond_to(:initialize_duplicate) }

    it 'raises an exception when initialize_duplicate is called' do
      expect { subject.initialize_duplicate(nil, nil) }.
        to raise_error(NotImplementedError)
    end
  end
end
