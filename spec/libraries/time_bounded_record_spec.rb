require 'rails_helper'

RSpec.describe 'Extension: Time Bounded Record', type: :model do
  class self::TimeBoundedTest < ActiveRecord::Base
    self.table_name = 'time_bounded_tests'
  end

  temporary_table(:time_bounded_tests) do |t|
    t.time_bounded
  end
  with_temporary_table(:time_bounded_tests) do
    let!(:valid_records) do
      [
        [nil, nil],
        [nil, 1.day],
        [-1.day, nil],
        [-1.day, 1.day]
      ].map do |pair|
        options = {}
        options[:start_at] = Time.zone.now + pair[0] unless pair[0].nil?
        options[:end_at] = Time.zone.now + pair[1] unless pair[1].nil?
        self.class::TimeBoundedTest.create!(options)
      end.select(&:currently_valid?)
    end

    it 'gets records which are still valid' do
      matching_entries = self.class::TimeBoundedTest.currently_valid
      expect(matching_entries.size).to eq(valid_records.length)

      matching_entries.each do |record|
        expect(record).to be_currently_valid
        expect(record.start_at).to satisfy { |v| v.nil? || v <= Time.zone.now }
        expect(record.end_at).to satisfy { |v| v.nil? || v >= Time.zone.now }
      end
    end

    context 'when the records have neither start_at nor end_at' do
      subject { self.class::TimeBoundedTest.new }

      it { is_expected.to be_currently_valid }
    end

    context 'when the records do not have start_at' do
      context 'when the records expire after today' do
        subject { self.class::TimeBoundedTest.new(end_at: Time.zone.now + 1.day) }

        it { is_expected.to be_currently_valid }
      end

      context 'when the records expire before today' do
        subject { self.class::TimeBoundedTest.new(end_at: Time.zone.now - 1.day) }

        it { is_expected.to_not be_currently_valid }
      end
    end

    context 'when the records do not have end_at' do
      context 'when the records become valid after today' do
        subject { self.class::TimeBoundedTest.new(start_at: Time.zone.now + 1.day) }

        it { is_expected.not_to be_currently_valid }
      end

      context 'when the records become valid before today' do
        subject { self.class::TimeBoundedTest.new(start_at: Time.zone.now - 1.day) }

        it { is_expected.to be_currently_valid }
      end
    end

    context 'when the records have both start_at and end_at' do
      context 'when the records have expired' do
        subject do
          self.class::TimeBoundedTest.new(start_at: Time.zone.now - 1.week,
                                          end_at: Time.zone.now - 1.day)
        end

        it { is_expected.to be_expired }
        it { is_expected.not_to be_currently_valid }
      end

      context 'when the records have not become valid' do
        subject do
          self.class::TimeBoundedTest.new(start_at: Time.zone.now + 1.day,
                                          end_at: Time.zone.now + 1.week)
        end

        it { is_expected.to be_not_yet_valid }
        it { is_expected.not_to be_currently_valid }
      end

      context 'when the records are become valid' do
        subject do
          self.class::TimeBoundedTest.new(start_at: Time.zone.now - 1.week,
                                          end_at: Time.zone.now + 1.week)
        end

        it { is_expected.to be_currently_valid }
      end
    end
  end
end
