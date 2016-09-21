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
  it { is_expected.to act_as(Course::ExperiencePointsRecord) }

  describe '#experience_points_display_reason' do
    it 'defaults to raise NotImplementedError' do
      expect { subject.experience_points_display_reason }.to raise_error(NotImplementedError)
    end
  end

  describe '#experience_points_reason_url_params' do
    it 'defaults to raise NotImplementedError' do
      expect { subject.experience_points_reason_url_params }.to raise_error(NotImplementedError)
    end
  end
end
