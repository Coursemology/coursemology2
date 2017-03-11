# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Log, type: :model do
  it { is_expected.to belong_to(:submission) }
end
