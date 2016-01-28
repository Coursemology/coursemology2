# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::TagGroup do
  it { is_expected.to have_many(:tags) }
end
