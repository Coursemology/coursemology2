# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Extensions::DateTimeHelpers do
  describe '.min' do
    it 'is a valid time in database' do
      expect { User.where.has { created_at > Time.min } }.not_to raise_error
    end
  end

  describe '.max' do
    it 'is a valid time in database' do
      expect { User.where.has { created_at < Time.max } }.not_to raise_error
    end
  end
end
