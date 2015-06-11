require 'rails_helper'

RSpec.describe 'Extension: Acts as Experience Points Record' do
  class ActsAsExperiencePointsRecordDummyClass < ActiveRecord::Base
    def self.columns
      []
    end

    acts_as_experience_points_record
  end

  subject { ActsAsExperiencePointsRecordDummyClass.new }
  it { is_expected.not_to be_manual_exp }
  it { is_expected.to respond_to(:points_awarded) }
  it { is_expected.to respond_to(:course_user) }
  it { is_expected.to respond_to(:acting_as) }
  it { expect(subject.acting_as).to respond_to(:specific) }
end
