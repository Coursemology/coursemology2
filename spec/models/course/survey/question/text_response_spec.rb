# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::Question::TextResponse, type: :model do
  it { is_expected.to act_as(Course::Survey::Question) }
end
