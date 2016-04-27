# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::Response do
  it { is_expected.to act_as(Course::ExperiencePointsRecord) }
  it { is_expected.to belong_to(:survey).inverse_of(:responses) }
  it { is_expected.to have_many(:answers).inverse_of(:response) }
end
