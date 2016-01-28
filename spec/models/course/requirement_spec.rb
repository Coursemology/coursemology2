# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition, type: :model do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:conditional) }
end
