# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::Question do
  it { is_expected.to belong_to(:section).inverse_of(:questions) }
  it { is_expected.to have_many(:options).inverse_of(:question).dependent(:destroy) }
  it { is_expected.to have_many(:answers).inverse_of(:question).dependent(:destroy) }
end
