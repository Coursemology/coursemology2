# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::Scribing, type: :model do
  it { is_expected.to act_as(Course::Assessment::Answer) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
  end
end
