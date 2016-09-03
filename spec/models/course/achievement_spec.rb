# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement, type: :model do
  it { is_expected.to have_many(:course_user_achievements).inverse_of(:achievement) }
  it { is_expected.to have_many(:course_users).through(:course_user_achievements) }
  it { is_expected.to have_many :conditions }
  it { is_expected.to validate_presence_of :title }
  it { is_expected.to belong_to(:course).inverse_of :achievements }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_user) { create(:course_user, course: course) }

    describe '.default_scope' do
      let!(:achievements) { create_list(:course_achievement, 2, course: course) }
      it 'orders by ascending weight' do
        weights = course.achievements.pluck(:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
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

    describe '#permitted_for!' do
      let(:achievement) { create(:course_achievement, course: course) }

      context 'when achievement does not have conditions' do
        it 'does not permit the achievement for the course user' do
          expect(achievement).to receive(:conditions).and_return([])
          achievement.permitted_for!(course_user)
          expect(achievement.course_users).to_not include(course_user)
        end
      end

      context 'when achievement have conditions' do
        it 'permit the achievement for the course user' do
          expect(achievement).to receive(:conditions).and_return([double('condition')])
          achievement.permitted_for!(course_user)
          expect(achievement.course_users).to include(course_user)
        end
      end
    end

    describe '#precluded_for!' do
      let(:achievement) do
        achievement = create(:course_achievement, course: course)
        achievement.course_users << course_user
        achievement
      end

      context 'when achievement was permitted to course user' do
        it 'precludes the achievement for the course user' do
          expect(achievement.course_users).to include(course_user)
          achievement.precluded_for!(course_user)
          expect(achievement.course_users).to_not include(course_user)
        end
      end
    end

    describe 'course_users' do
      let(:achievement) do
        achievement = create(:course_achievement, course: course)
        achievement.course_users << course_user
        achievement
      end

      context 'when achievement is destroyed' do
        it 'does not destroy course users' do
          achievement.destroy!
          expect(achievement.destroyed?).to be_truthy
          expect(course_user.destroyed?).to be_falsey
        end
      end
    end
  end
end
