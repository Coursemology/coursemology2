# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Time Bounded Record', type: :model do
  class self::TimeBoundedTest < ApplicationRecord
    self.table_name = 'time_bounded_tests'
  end

  temporary_table(:time_bounded_tests) do |t| # rubocop:disable Style/SymbolProc
    t.time_bounded
  end
  with_temporary_table(:time_bounded_tests) do
    let!(:valid_records) do
      [
        [nil, nil],
        [nil, 1.day],
        [-1.days, nil],
        [-1.days, 1.day]
      ].map do |pair|
        options = {}
        options[:start_at] = Time.zone.now + pair[0] unless pair[0].nil?
        options[:end_at] = Time.zone.now + pair[1] unless pair[1].nil?
        self.class::TimeBoundedTest.create!(options)
      end.select(&:currently_active?)
    end

    it 'gets records which are currently active' do
      matching_entries = self.class::TimeBoundedTest.currently_active
      expect(matching_entries.size).to eq(valid_records.length)

      matching_entries.each do |record|
        expect(record).to be_currently_active
        expect(record.start_at).to satisfy { |v| v.nil? || v <= Time.zone.now }
        expect(record.end_at).to satisfy { |v| v.nil? || v >= Time.zone.now }
      end
    end

    context 'when the records have neither start_at nor end_at' do
      subject { self.class::TimeBoundedTest.new }

      it { is_expected.to be_currently_active }
    end

    context 'when the records do not have start_at' do
      context 'when the records expire after today' do
        subject { self.class::TimeBoundedTest.new(end_at: Time.zone.now + 1.day) }

        it { is_expected.to be_currently_active }
      end

      context 'when the records expire before today' do
        subject { self.class::TimeBoundedTest.new(end_at: Time.zone.now - 1.day) }

        it { is_expected.to_not be_currently_active }
      end
    end

    context 'when the records do not have end_at' do
      context 'when the records become valid after today' do
        subject { self.class::TimeBoundedTest.new(start_at: Time.zone.now + 1.day) }

        it { is_expected.not_to be_currently_active }
      end

      context 'when the records become valid before today' do
        subject { self.class::TimeBoundedTest.new(start_at: Time.zone.now - 1.day) }

        it { is_expected.to be_currently_active }
      end
    end

    context 'when the records have both start_at and end_at' do
      context 'when the records have ended' do
        subject do
          self.class::TimeBoundedTest.new(start_at: Time.zone.now - 1.week,
                                          end_at: Time.zone.now - 1.day)
        end

        it { is_expected.to be_ended }
        it { is_expected.not_to be_currently_active }
      end

      context 'when the records have not become valid' do
        subject do
          self.class::TimeBoundedTest.new(start_at: Time.zone.now + 1.day,
                                          end_at: Time.zone.now + 1.week)
        end

        it { is_expected.not_to be_started }
        it { is_expected.not_to be_currently_active }
      end

      context 'when the records are become valid' do
        subject do
          self.class::TimeBoundedTest.new(start_at: Time.zone.now - 1.week,
                                          end_at: Time.zone.now + 1.week)
        end

        it { is_expected.to be_currently_active }
      end
    end
  end
end
