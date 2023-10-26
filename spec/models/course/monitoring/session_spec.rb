# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Monitoring::Session, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:default_max_session_duration) { described_class::DEFAULT_MAX_SESSION_DURATION }

    it { should define_enum_for(:status) }
    it { should belong_to(:monitor).inverse_of(:sessions) }
    it { should have_many(:heartbeats).inverse_of(:session) }
    it { should validate_presence_of(:monitor_id) }
    it { should validate_presence_of(:status) }
    it { should validate_presence_of(:misses) }
    it { should validate_numericality_of(:misses).only_integer.is_greater_than_or_equal_to(0) }

    describe '#status' do
      context 'when created_at is now' do
        subject { create(:course_monitoring_session, created_at: Time.zone.now) }

        it 'has expired? returns false' do
          expect(subject.expired?).to be_falsey
        end

        it 'has listening? returns true' do
          expect(subject.listening?).to be_truthy
        end

        it 'has stopped? returns false' do
          expect(subject.stopped?).to be_falsey
        end

        it 'has :listening status' do
          expect(subject.status).to eq(:listening)
        end

        context 'when stopped' do
          before { subject.assign_attributes(status: :stopped) }

          it 'has expired? returns false' do
            expect(subject.expired?).to be_falsey
          end

          it 'has listening? returns false' do
            expect(subject.listening?).to be_falsey
          end

          it 'has stopped? returns true' do
            expect(subject.stopped?).to be_truthy
          end

          it 'has :stopped status' do
            expect(subject.status).to eq(:stopped)
          end
        end
      end

      context 'when created older than the default max session duration' do
        subject { create(:course_monitoring_session, created_at: Time.zone.now - default_max_session_duration) }

        it 'has expired? returns true' do
          expect(subject.expired?).to be_truthy
        end

        it 'has listening? returns false' do
          expect(subject.listening?).to be_falsey
        end

        it 'has stopped? returns true' do
          expect(subject.stopped?).to be_truthy
        end

        it 'has :expired status' do
          expect(subject.status).to eq(:expired)
        end

        context 'when stopped' do
          before { subject.assign_attributes(status: :stopped) }

          it 'has expired? returns true' do
            expect(subject.expired?).to be_truthy
          end

          it 'has listening? returns false' do
            expect(subject.listening?).to be_falsey
          end

          it 'has stopped? returns true' do
            expect(subject.stopped?).to be_truthy
          end

          it 'has :expired status' do
            expect(subject.status).to eq(:expired)
          end
        end
      end
    end

    describe '#expiry' do
      let(:creation_time) { Time.zone.now }
      subject { create(:course_monitoring_session, created_at: creation_time).expiry }

      it { should be_within(default_max_session_duration).of(creation_time) }
    end

    describe '#last_live_heartbeat' do
      let(:session) { create(:course_monitoring_session) }
      let!(:live_heartbeat) { create(:course_monitoring_heartbeat, session: session) }
      let!(:stale_heartbeat) { create(:course_monitoring_heartbeat, :stale, session: session) }

      it 'returns the last live heartbeat' do
        expect(session.heartbeats.count).to eq(2)
        expect(session.last_live_heartbeat).to eq(live_heartbeat)
      end
    end
  end
end
