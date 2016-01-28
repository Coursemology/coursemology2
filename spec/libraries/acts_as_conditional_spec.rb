# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Conditional', type: :model do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:achievement) do
      achievement = build(:achievement, course: course)
      create(:achievement_condition, achievement: achievement)
      achievement
    end

    describe '#conditions' do
      subject { achievement.conditions }

      it 'is of type Condition' do
        expect(subject).to all be_instance_of(Course::Condition)
      end
    end

    describe '#specific_conditions' do
      subject { achievement.specific_conditions }

      it 'is of the specific condition type' do
        expect(subject).to all be_instance_of(Course::Condition::Achievement)
      end
    end

    describe '#conditions_satisfied_by?' do
      subject { achievement }
      let(:satisfied_condition) do
        condition = instance_double(Course::Condition)
        allow(condition).to receive(:satisfied_by?).and_return(true)
        condition
      end
      let(:unsatisfied_condition) do
        condition = instance_double(Course::Condition)
        allow(condition).to receive(:satisfied_by?).and_return(false)
        condition
      end

      context 'all conditions are satisfied' do
        it 'returns true' do
          allow(subject).to receive(:conditions).and_return([satisfied_condition])
          expect(subject.conditions_satisfied_by?(double)).to be_truthy
        end
      end

      context 'a condition is not satisfied' do
        it 'returns false' do
          allow(subject).to receive(:conditions).and_return([satisfied_condition,
                                                             unsatisfied_condition])
          expect(subject.conditions_satisfied_by?(double)).to be_falsey
        end
      end
    end
  end
end
