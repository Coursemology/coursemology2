# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Tag do
  it { is_expected.to belong_to(:tag_group) }
  it { is_expected.to have_and_belong_to_many(:questions) }
end
