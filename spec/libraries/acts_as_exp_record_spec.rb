# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Experience Points Record' do
  class self::DummyClass < ActiveRecord::Base
    def self.columns
      []
    end

    acts_as_experience_points_record
  end

  subject { self.class::DummyClass.new }
  it { is_expected.not_to be_manually_awarded }
  it { is_expected.to respond_to(:points_awarded) }
  it { is_expected.to respond_to(:course_user) }
  it { is_expected.to respond_to(:acting_as) }
  it { expect(subject.acting_as).to respond_to(:specific) }
  it { expect { subject.experience_points_display_reason }.to raise_error(NotImplementedError) }
end
