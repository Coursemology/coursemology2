# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SkillBranch do
  it { is_expected.to belong_to(:course).inverse_of(:assessment_skill_branches) }
  it { is_expected.to have_many(:skills).dependent(:destroy) }
end
