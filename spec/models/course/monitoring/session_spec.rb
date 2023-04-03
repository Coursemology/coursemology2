# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Monitoring::Session, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    it { should define_enum_for(:status) }
    it { should belong_to(:monitor).inverse_of(:sessions) }
    it { should have_many(:heartbeats).inverse_of(:session) }
    it { should validate_presence_of(:monitor_id) }
    it { should validate_presence_of(:status) }
  end
end
