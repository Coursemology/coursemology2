require 'rails_helper'

RSpec.describe 'Extension: Acts as Lesson Plan Item' do
  class self::DummyClass < ActiveRecord::Base
    def self.columns
      []
    end

    acts_as_lesson_plan_item
  end

  subject(:dummy) { self.class::DummyClass.new }
  it { is_expected.to respond_to(:base_exp) }
  it { is_expected.to respond_to(:time_bonus_exp) }
  it { is_expected.to respond_to(:extra_bonus_exp) }
  it { is_expected.to respond_to(:start_time) }
  it { is_expected.to respond_to(:end_time) }
  it { is_expected.to respond_to(:bonus_end_time) }
  it { is_expected.to respond_to(:total_exp) }
  it { is_expected.to respond_to(:acting_as) }
  it { expect(dummy.acting_as).to respond_to(:specific) }

  context 'when functioning as an EXP Source' do
    describe 'sets and sums EXP correctly' do
      subject do
        dummy.tap do |d|
          d.base_exp = rand(1..10)
          d.extra_bonus_exp = rand(1..10)
        end
      end
      it 'has correct total EXP' do
        expect(subject.total_exp).to eq(subject.base_exp + subject.extra_bonus_exp)
      end
    end
  end
end
