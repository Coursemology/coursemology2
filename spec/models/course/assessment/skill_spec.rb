# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Skill do
  it { is_expected.to belong_to(:course).inverse_of(:assessment_skills) }
  it { is_expected.to belong_to(:skill_branch) }
  it { is_expected.to have_and_belong_to_many(:questions) }
end
