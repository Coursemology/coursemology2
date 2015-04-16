require 'rails_helper'

RSpec.describe 'acts_as_lesson_plan_item' do
  class DummyClass < ActiveRecord::Base
    def self.columns
      []
    end

    acts_as_lesson_plan_item
  end

  subject(:dummy) { DummyClass.new }
  it { is_expected.to respond_to :base_exp }
  it { is_expected.to respond_to :time_bonus_exp }
  it { is_expected.to respond_to :extra_bonus_exp }
  it { is_expected.to respond_to :start_time }
  it { is_expected.to respond_to :end_time }
  it { is_expected.to respond_to :bonus_cutoff_time }
  it { is_expected.to respond_to :total_exp }
  it { is_expected.to respond_to :acting_as }
  it { expect(dummy.acting_as).to respond_to :specific }

  context 'when functioning as an EXP Source' do
    describe 'sets and sums EXP correctly' do
      before do
        base = rand(1..10)
        extra_bonus = rand(1..10)
        dummy.base_exp = base
        dummy.extra_bonus_exp = extra_bonus
        @total = base + extra_bonus
      end
      subject { dummy.total_exp }
      it { is_expected.to eq @total }
    end
  end
end
