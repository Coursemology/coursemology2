# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Monitoring::Monitor, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    it { should have_one(:assessment).inverse_of(:monitor) }
    it { should have_many(:sessions).inverse_of(:monitor) }
    it { should validate_numericality_of(:max_interval_ms).only_integer.is_greater_than(0) }
    it { should validate_numericality_of(:offset_ms).only_integer.is_greater_than(0) }

    it do
      should validate_numericality_of(:min_interval_ms).
        only_integer.
        is_greater_than_or_equal_to(Course::Monitoring::Monitor::DEFAULT_MIN_INTERVAL_MS)
    end

    describe '#validations' do
      subject { create(:course_monitoring_monitor) }

      context 'when max_interval_ms is greater than min_interval_ms' do
        it 'is valid' do
          subject.assign_attributes(min_interval_ms: 4000, max_interval_ms: 5000)
          expect(subject).to be_valid
          expect(subject.errors[:max_interval_ms]).not_to be_present
        end
      end

      context 'when max_interval_ms is less than min_interval_ms' do
        it 'is not valid' do
          subject.assign_attributes(min_interval_ms: 5000, max_interval_ms: 4000)
          expect(subject).not_to be_valid
          expect(subject.errors[:max_interval_ms]).to be_present
        end
      end

      context 'when secret is not set' do
        it 'cannot block' do
          subject.assign_attributes(secret: nil, blocks: true)
          expect(subject).not_to be_valid
          expect(subject.errors[:blocks]).to be_present
        end
      end

      context 'when session protection is disabled' do
        before { subject.assessment.update!(session_password: nil) }

        it 'cannot block' do
          subject.assign_attributes(blocks: true)
          expect(subject).not_to be_valid
          expect(subject.errors[:blocks]).to be_present
        end
      end

      context 'when secret is set and session protection is enabled' do
        before do
          subject.update!(secret: SecureRandom.hex)
          subject.assessment.update!(session_password: SecureRandom.hex)
        end

        it 'can block' do
          subject.assign_attributes(blocks: true)
          expect(subject).to be_valid
          expect(subject.errors[:blocks]).not_to be_present
        end
      end

      context 'when the assessment is not password-protected' do
        before { subject.assessment.update!(view_password: nil) }

        it 'cannot be enabled' do
          subject.assign_attributes(enabled: true)
          expect(subject).not_to be_valid
          expect(subject.errors[:enabled]).to be_present
        end
      end
    end

    describe '#valid_heartbeat?' do
      context 'when browser_authorization_method is user_agent' do
        context 'when secret is not set' do
          subject { create(:course_monitoring_monitor, secret: nil) }

          it 'always returns true' do
            heartbeat = create(:course_monitoring_heartbeat)
            expect(subject.valid_heartbeat?(heartbeat)).to be_truthy
          end
        end

        context 'when secret is set' do
          subject { create(:course_monitoring_monitor, secret: 'something') }

          it 'returns true if the given substring matches' do
            heartbeat = create(:course_monitoring_heartbeat, user_agent: subject.secret)
            expect(subject.valid_heartbeat?(heartbeat)).to be(true)
          end

          it 'returns true if the given substring includes' do
            heartbeat = create(:course_monitoring_heartbeat, user_agent: "#{subject.secret} weird")
            expect(subject.valid_heartbeat?(heartbeat)).to be(true)
          end

          it 'returns false if the given substring does not include' do
            heartbeat = create(:course_monitoring_heartbeat)
            expect(subject.valid_heartbeat?(heartbeat)).to be(false)
          end
        end
      end

      context 'when browser_authorization_method is seb_config_key' do
        subject do
          create(
            :course_monitoring_monitor,
            :with_seb_config_key,
            seb_config_key: '5521fd207deab9de034f67869d429ae97585b85cf977a0bed298c03cb9027995'
          )
        end

        context 'when the given payload is valid' do
          let(:heartbeat) do
            create(:course_monitoring_heartbeat, seb_payload: {
              config_key_hash: '5d0b0ab4ae35649b60ad45b2e6c3520b5b7a3367b03207ebcd986c79fc002f6f',
              url: 'http://192.168.1.25:8080/AuthenticatedApp.js'
            })
          end

          it { expect(subject.valid_heartbeat?(heartbeat)).to be(true) }
        end

        context 'when the given payload is invalid' do
          let(:heartbeat) do
            create(:course_monitoring_heartbeat, seb_payload: {
              config_key_hash: SecureRandom.hex,
              url: SecureRandom.hex
            })
          end

          it { expect(subject.valid_heartbeat?(heartbeat)).to be(false) }
        end
      end
    end
  end
end
