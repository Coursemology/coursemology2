# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Legacy', type: :model do
  describe 'maximum string column length' do
    class self::ExtensionLegacyStringColumnLength < ApplicationRecord
    end

    temporary_table(:extension_legacy_string_column_lengths) do |t|
      t.string :test
    end
    with_temporary_table(:extension_legacy_string_column_lengths) do
      it 'imposes a limit of 255 characters' do
        test = self.class::ExtensionLegacyStringColumnLength.new(test: '6' * 256)
        expect(test.valid?).to be_falsey
        expect(test.errors[:test].find { |e| e =~ /too long/i }).not_to be_nil
      end
    end
  end
end
