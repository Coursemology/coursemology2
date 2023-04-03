# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Monitoring::Heartbeat, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:heartbeat) { create(:course_monitoring_heartbeat) }

    it { should belong_to(:session).inverse_of(:heartbeats).without_validating_presence }
    it { should validate_presence_of(:session) }
    it { should validate_presence_of(:user_agent) }
    it { should validate_presence_of(:generated_at) }

    describe '#validations' do
      subject { heartbeat }

      context 'when ip address is invalid' do
        it 'is not valid' do
          subject.assign_attributes(ip_address: 'invalid')
          expect(subject).not_to be_valid
          expect(subject.errors[:ip_address]).to be_present
        end
      end
    end
  end
end
