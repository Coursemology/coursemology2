# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Conditional', type: :model do
  class self::DummyConditionalClass < ApplicationRecord
    def self.columns
      []
    end

    def self.load_schema!; end

    attr_accessor :satisfiability_type
    acts_as_conditional
  end

  class self::DummyConditionClass < ApplicationRecord
    def self.columns
      []
    end

    def self.load_schema!; end

    acts_as_condition
  end

  describe 'objects which act as conditional' do
    subject { self.class::DummyConditionalClass.new }

    it { is_expected.to have_many(:conditions).inverse_of(:conditional) }
    it { is_expected.to respond_to(:satisfiability_type) }

    it '#set_all_conditions_satisfiability_type! sets the satisfiability type to all conditions' do
      subject.satisfiability_type = :at_least_one_condition
      subject.set_all_conditions_satisfiability_type!
      expect(subject.satisfiability_type).to eq(:all_conditions)
    end

    it '#set_at_least_one_condition_satisfiability_type! sets the satisfiability type to at least one condition' do
      subject.satisfiability_type = :all_conditions
      subject.set_at_least_one_condition_satisfiability_type!
      expect(subject.satisfiability_type).to eq(:at_least_one_condition)
    end

    it 'implements #permitted_for!' do
      expect(subject).to respond_to(:permitted_for!)
      expect { subject.permitted_for!(double) }.to raise_error(NotImplementedError)
    end

    it 'implements #precluded_for!' do
      expect(subject).to respond_to(:precluded_for!)
      expect { subject.precluded_for!(double) }.to raise_error(NotImplementedError)
    end

    describe '#specific_conditions' do
      it 'is of the specific condition type' do
        condition = instance_double(Course::Condition)
        allow(condition).to receive(:actable).
          and_return(self.class::DummyConditionClass.new)
        allow(subject).to receive(:conditions).and_return [condition]

        expect(subject.specific_conditions).to all be_instance_of(self.class::DummyConditionClass)
      end
    end

    describe '#conditions_satisfied_by?' do
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

      context 'all conditions satisfiability type' do
        before { subject.set_all_conditions_satisfiability_type! }

        context 'no conditions' do
          it 'returns true' do
            allow(subject).to receive(:conditions).and_return([])
            expect(subject.conditions_satisfied_by?(double)).to be_truthy
          end
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

      context 'at least one condition satisfiability type' do
        before { subject.set_at_least_one_condition_satisfiability_type! }

        context 'no conditions' do
          it 'returns true' do
            allow(subject).to receive(:conditions).and_return([])
            expect(subject.conditions_satisfied_by?(double)).to be_truthy
          end
        end

        context 'all conditions are satisfied' do
          it 'returns true' do
            allow(subject).to receive(:conditions).and_return([satisfied_condition])
            expect(subject.conditions_satisfied_by?(double)).to be_truthy
          end
        end

        context 'at least one condition is satisfied' do
          it 'returns false' do
            allow(subject).to receive(:conditions).and_return([satisfied_condition,
                                                               unsatisfied_condition])
            expect(subject.conditions_satisfied_by?(double)).to be_truthy
          end
        end
      end
    end
  end
end
