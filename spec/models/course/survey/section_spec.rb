# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::Section do
  it { is_expected.to belong_to(:survey).inverse_of(:sections) }
  it { is_expected.to have_many(:questions).inverse_of(:section).dependent(:destroy) }
end
