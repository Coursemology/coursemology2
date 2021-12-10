# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LearningMap, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:learning_map) }
end
