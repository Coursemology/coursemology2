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
        subject do
          created_at = Time.zone.now - Course::Monitoring::Session::DEFAULT_MAX_SESSION_DURATION
          create(:course_monitoring_session, created_at: created_at)
        end

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
      subject { create(:course_monitoring_session, created_at: Time.zone.now) }

      it do
        default_max_session = Course::Monitoring::Session::DEFAULT_MAX_SESSION_DURATION
        expect(subject.expiry).to be_within(default_max_session).of(Time.zone.now)
      end
    end
  end
end
