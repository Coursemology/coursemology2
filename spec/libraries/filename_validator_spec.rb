# frozen_string_literal: true
require 'rails_helper'

RSpec.describe FilenameValidator do
  class self::FileModel < ApplicationRecord
    def self.columns
      []
    end

    attr_accessor :name

    validates_with FilenameValidator
  end

  describe '#validate' do
    subject { self.class::FileModel.new }

    context 'when the filename is valid' do
      let(:valid_filenames) { ['Name', 'File Name', 'I\'m valid'] }

      it 'is valid' do
        valid_filenames.each do |name|
          subject.name = name
          expect(subject).to be_valid
        end
      end
    end

    context 'when the filename is not valid' do
      let(:invalid_filenames) do
        [
          ' name', 'name  ', 'name.', 'na/me', 'na\me',
          'na*me', 'na|me', 'na<me', 'na>me', 'na"me'
        ]
      end

      it 'is not valid' do
        invalid_filenames.each do |name|
          subject.name = name
          expect(subject).not_to be_valid
        end
      end
    end
  end
end
