# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement, type: :model do
  it { is_expected.to have_many(:course_user_achievements).inverse_of(:achievement) }
  it { is_expected.to have_many(:course_users).through(:course_user_achievements) }
  it { is_expected.to have_many :conditions }
  it { is_expected.to validate_presence_of :title }
  it { is_expected.to belong_to(:course).inverse_of :achievements }
  it { is_expected.to have_many(:achievement_conditions).dependent(:destroy) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.default_scope' do
      let(:course) { create(:course) }
      let!(:achievements) { create_list(:course_achievement, 2, course: course) }
      it 'orders by ascending weight' do
        weights = course.achievements.pluck(:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end

      it 'implements #permitted_for!' do
        expect(subject).to respond_to(:permitted_for!)
        expect { subject.permitted_for!(double) }.to_not raise_error
      end

      it 'implements #precluded_for!' do
        expect(subject).to respond_to(:precluded_for!)
        expect { subject.precluded_for!(double) }.to_not raise_error
      end
    end

    describe '#manually_awarded?' do
      let(:achievement) { create(:course_achievement) }
      subject { achievement.manually_awarded? }

      context 'when achievement has no conditions' do
        it { is_expected.to be_truthy }
      end

      context 'when achievement has 1 or more conditions' do
        before { create(:course_condition_achievement, conditional: achievement) }

        it { is_expected.to be_falsey }
      end
    end
  end
end
