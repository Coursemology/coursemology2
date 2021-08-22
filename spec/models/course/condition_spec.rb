# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition, type: :model do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:conditional) }

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '.find_conditionals_of' do
      let(:achievement) { create(:achievement, course: course) }

      context 'when there is no conditional depending the object' do
        let(:condition) { create(:achievement_condition, course: course) }

        it 'returns an empty array' do
          expect(Course::Condition.find_conditionals_of(achievement)).to be_empty
        end
      end

      context 'when there are conditionals depending the object' do
        let(:conditional1) { create(:achievement, course: course) }
        let!(:condition1) do
          create(:achievement_condition,
                 course: course, achievement: achievement, conditional: conditional1)
        end
        let(:conditional2) { create(:assessment, course: course) }
        let!(:condition2) do
          create(:achievement_condition,
                 course: course, achievement: achievement, conditional: conditional2)
        end

        it 'returns all conditionals' do
          expect(Course::Condition.find_conditionals_of(achievement)).
            to contain_exactly(conditional1, conditional2)
        end
      end
    end

    describe '.dependent_class_to_condition_class_mapping' do
      context 'when multiple conditions depend on the same class' do
        it 'returns the mapping with an array of all the conditions' do
          allow(Course::Condition::Achievement).
            to receive(:dependent_class).and_return(Course::Achievement.name)
          allow(Course::Condition::Assessment).
            to receive(:dependent_class).and_return(Course::Achievement.name)
          allow(Course::Condition::Survey).
            to receive(:dependent_class).and_return(Course::Achievement.name)
          actual_mapping = Course::Condition.send(:dependent_class_to_condition_class_mapping)
          expected_mapping = { Course::Achievement.name => [Course::Condition::Achievement.name,
                                                            Course::Condition::Assessment.name,
                                                            Course::Condition::Survey.name] }
          expect(actual_mapping).to eq(expected_mapping)
        end
      end
    end

    describe '.conditionals_for' do
      let!(:conditional1) { create(:achievement, course: course) }
      let!(:conditional2) { create(:achievement) }
      subject { Course::Condition.conditionals_for(course) }

      it { is_expected.to contain_exactly(conditional1) }
    end
  end
end
