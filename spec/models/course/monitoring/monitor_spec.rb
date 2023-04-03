# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Monitoring::Monitor, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    it { should have_many(:sessions).inverse_of(:monitor).dependent(:destroy) }
    it { should validate_numericality_of(:min_interval_ms).only_integer.is_greater_than(0) }
    it { should validate_numericality_of(:max_interval_ms).only_integer.is_greater_than(0) }
    it { should validate_numericality_of(:offset_ms).only_integer.is_greater_than(0) }
  end
end
