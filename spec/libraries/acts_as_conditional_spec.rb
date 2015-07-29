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

    describe('#conditions') do
      subject { achievement.conditions }

      it 'is of type Condition' do
        expect(subject).to all be_instance_of(Course::Condition)
      end
    end

    describe('#specific_conditions') do
      subject { achievement.specific_conditions }

      it 'is of the specific condition type' do
        expect(subject).to all be_instance_of(Course::Condition::Achievement)
      end
    end
  end
end
