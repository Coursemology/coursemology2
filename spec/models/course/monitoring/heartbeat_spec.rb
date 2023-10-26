# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Monitoring::Heartbeat, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:heartbeat) { create(:course_monitoring_heartbeat) }
    let(:session) { heartbeat.session }
    let(:monitor) { session.monitor }

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

    describe '#update_session_misses' do
      let(:generated_time) { heartbeat.generated_at + (delta / 1000).seconds }

      subject { build(:course_monitoring_heartbeat, session: session, generated_at: generated_time) }

      context 'when a heartbeat is overly late' do
        let(:delta) { monitor.max_interval_ms + monitor.offset_ms + 2.seconds.in_milliseconds }

        context 'when its save succeeds' do
          it 'increases the session misses by 1' do
            expect { subject.save }.
              to change { heartbeat.session.heartbeats.count }.by(1).
              and change { heartbeat.session.misses }.by(1)
          end
        end

        context 'when its save fails' do
          before { allow(subject).to receive(:valid?).and_return(false) }

          it 'does not change the session misses' do
            expect { subject.save }.
              to change { heartbeat.session.heartbeats.count }.by(0).
              and change { heartbeat.session.misses }.by(0)
          end
        end
      end

      context 'when a late heartbeat is saved' do
        let(:delta) { monitor.max_interval_ms + (monitor.offset_ms / 2) }

        it 'does not change the session misses' do
          expect { subject.save }.
            to change { heartbeat.session.heartbeats.count }.by(1).
            and change { heartbeat.session.misses }.by(0)
        end
      end

      context 'when a timely heartbeat is saved' do
        let(:delta) { monitor.max_interval_ms / 2 }

        it 'does not change the session misses' do
          expect { subject.save }.
            to change { heartbeat.session.heartbeats.count }.by(1).
            and change { heartbeat.session.misses }.by(0)
        end
      end

      context 'when the last heartbeat is timely but stale' do
        let!(:stale_heartbeat) do
          five_seconds_after = heartbeat.generated_at + ((monitor.max_interval_ms - 1000) / 1000).seconds
          create(:course_monitoring_heartbeat, :stale, session: session, generated_at: five_seconds_after)
        end

        let(:delta) { monitor.max_interval_ms + monitor.offset_ms + 2.seconds.in_milliseconds }

        # `heartbeat` <--5 seconds--> `stale_heartbeat` <--5 seconds--> `subject`
        # max_interval_ms: 6 seconds, offset_ms: 2 seconds
        it 'increases the session misses by 1' do
          expect { subject.save }.
            to change { heartbeat.session.heartbeats.count }.by(1).
            and change { heartbeat.session.misses }.by(1)
        end
      end
    end
  end
end
