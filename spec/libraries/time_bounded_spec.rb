require 'rails_helper'

describe 'time_bounded', type: :model do
  class TimeBoundedTest < ActiveRecord::Base
  end

  before :all do
    ActiveRecord::Migration.create_table :time_bounded_tests do |t|
      t.time_bounded
    end

    [
      [nil, nil],
      [nil, 1.day],
      [-1.day, nil],
      [-1.day, 1.day]
    ].each do |pair|
      options = {}
      options[:valid_from] = DateTime.now + pair[0] unless pair[0].nil?
      options[:valid_to] = DateTime.now + pair[1] unless pair[1].nil?
      TimeBoundedTest.create!(options)
    end
  end

  after :all do
    ActiveRecord::Migration.drop_table :time_bounded_tests
  end

  it 'gets records which are still valid' do
    matching_entries = TimeBoundedTest.currently_valid
    expect(matching_entries).to_not be_empty

    matching_entries.each do |record|
      expect(record).to be_currently_valid
      expect(record.valid_from).to satisfy { |v| v.nil? || v <= DateTime.now }
      expect(record.valid_to).to satisfy { |v| v.nil? || v >= DateTime.now }
    end
  end

  context 'when the records have neither valid_from nor valid_to' do
    subject { TimeBoundedTest.new }

    it { is_expected.to be_currently_valid }
  end

  context 'when the records do not have valid_from' do
    context 'when the records expire after today' do
      subject { TimeBoundedTest.new(valid_to: DateTime.now + 1.day) }

      it { is_expected.to be_currently_valid }
    end

    context 'when the records expire before today' do
      subject { TimeBoundedTest.new(valid_to: DateTime.now - 1.day) }

      it { is_expected.to_not be_currently_valid }
    end
  end

  context 'when the records do not have valid_to' do
    context 'when the records become valid after today' do
      subject { TimeBoundedTest.new(valid_from: DateTime.now + 1.day) }

      it { is_expected.not_to be_currently_valid }
    end

    context 'when the records become valid before today' do
      subject { TimeBoundedTest.new(valid_from: DateTime.now - 1.day) }

      it { is_expected.to be_currently_valid }
    end
  end

  context 'when the records have both valid_from and valid_to' do
    context 'when the records have expired' do
      subject do
        TimeBoundedTest.new(valid_from: DateTime.now - 1.week,
                            valid_to: DateTime.now - 1.day)
      end

      it { is_expected.not_to be_currently_valid }
    end

    context 'when the records have not become valid' do
      subject do
        TimeBoundedTest.new(valid_from: DateTime.now + 1.day,
                            valid_to: DateTime.now + 1.week)
      end

      it { is_expected.not_to be_currently_valid }
    end

    context 'when the records are become valid' do
      subject do
        TimeBoundedTest.new(valid_from: DateTime.now - 1.week,
                            valid_to: DateTime.now + 1.week)
      end

      it { is_expected.to be_currently_valid }
    end
  end
end
