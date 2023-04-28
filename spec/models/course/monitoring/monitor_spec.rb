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
    end

    describe '#valid_secret?' do
      context 'when secret is not set' do
        subject { create(:course_monitoring_monitor, secret: nil) }

        it 'always returns true' do
          expect(subject.valid_secret?('anything')).to be_truthy
        end
      end

      context 'when secret is set' do
        subject { create(:course_monitoring_monitor, secret: 'something') }

        it 'returns true if the given substring matches' do
          expect(subject.valid_secret?('something')).to be(true)
        end

        it 'returns true if the given substring includes' do
          expect(subject.valid_secret?('something weird')).to be(true)
        end

        it 'returns false if the given substring does not include' do
          expect(subject.valid_secret?('anything')).to be(false)
        end

        it 'returns false if the given substring is nil' do
          expect(subject.valid_secret?(nil)).to be(false)
        end
      end
    end
  end
end
