# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::Question do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:survey).inverse_of(:questions) }
end
