# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::Answer do
  it { is_expected.to belong_to(:response).inverse_of(:answers) }
  it { is_expected.to belong_to(:question) }
  it { is_expected.to have_many(:options).inverse_of(:answer).dependent(:destroy) }
end
