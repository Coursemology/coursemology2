# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Gradebook::LevelConfig do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    it { is_expected.to belong_to(:course) }

    describe 'validations' do
      it 'is valid with defaults (disabled, blank formula)' do
        expect(build(:course_gradebook_level_config, course: course)).to be_valid
      end

      it 'requires a formula when enabled' do
        config = build(:course_gradebook_level_config, course: course, enabled: true, formula: '')
        expect(config).not_to be_valid
      end

      it 'allows a blank formula when disabled' do
        config = build(:course_gradebook_level_config, course: course, enabled: false, formula: '')
        expect(config).to be_valid
      end

      it 'rejects a negative weight' do
        config = build(:course_gradebook_level_config, course: course, weight: -1)
        expect(config).not_to be_valid
      end

      it 'enforces one config per course' do
        create(:course_gradebook_level_config, course: course)
        expect(build(:course_gradebook_level_config, course: course)).not_to be_valid
      end
    end

    it 'is destroyed with its course' do
      create(:course_gradebook_level_config, course: course)
      expect { course.destroy! }.to change { described_class.count }.by(-1)
    end

    describe '.upsert_for' do
      it 'creates a config from a camelCase-free attrs hash' do
        config = described_class.upsert_for(
          course: course,
          attrs: { enabled: true, formula: 'min(level, 30) * 0.05', weight: 8, show: true }
        )
        expect(config.enabled).to eq(true)
        expect(config.formula).to eq('min(level, 30) * 0.05')
        expect(config.weight).to eq(8)
        expect(config.show).to eq(true)
      end

      it 'updates the existing singleton on a second call' do
        described_class.upsert_for(course: course, attrs: { enabled: true, formula: 'level', weight: 2 })
        described_class.upsert_for(course: course, attrs: { enabled: false, formula: '', weight: 0 })
        expect(described_class.where(course_id: course.id).count).to eq(1)
        expect(course.reload.gradebook_level_config.enabled).to eq(false)
      end

      it 'raises RecordInvalid when enabled with a blank formula' do
        expect do
          described_class.upsert_for(course: course, attrs: { enabled: true, formula: '', weight: 1 })
        end.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    describe '.valid_ast?' do
      it 'accepts a num node' do
        expect(described_class.valid_ast?({ 'type' => 'num', 'value' => 3.5 })).to be true
      end

      it 'accepts a var node for level' do
        expect(described_class.valid_ast?({ 'type' => 'var', 'name' => 'level' })).to be true
      end

      it 'rejects var with wrong name' do
        expect(described_class.valid_ast?({ 'type' => 'var', 'name' => 'xp' })).to be false
      end

      it 'accepts a neg node with valid operand' do
        expect(described_class.valid_ast?({ 'type' => 'neg',
                                            'operand' => { 'type' => 'var', 'name' => 'level' } })).to be true
      end

      it 'accepts a binop node with valid op and children' do
        node = {
          'type' => 'binop', 'op' => '*',
          'left' => { 'type' => 'var', 'name' => 'level' },
          'right' => { 'type' => 'num', 'value' => 0.5 }
        }
        expect(described_class.valid_ast?(node)).to be true
      end

      it 'rejects binop with invalid op' do
        node = {
          'type' => 'binop', 'op' => '%',
          'left' => { 'type' => 'num', 'value' => 1 },
          'right' => { 'type' => 'num', 'value' => 1 }
        }
        expect(described_class.valid_ast?(node)).to be false
      end

      it 'accepts a call1 node' do
        node = { 'type' => 'call1', 'fn' => 'floor', 'arg' => { 'type' => 'var', 'name' => 'level' } }
        expect(described_class.valid_ast?(node)).to be true
      end

      it 'rejects call1 with unknown fn' do
        node = { 'type' => 'call1', 'fn' => 'sqrt', 'arg' => { 'type' => 'var', 'name' => 'level' } }
        expect(described_class.valid_ast?(node)).to be false
      end

      it 'accepts a call2 node' do
        node = {
          'type' => 'call2', 'fn' => 'min',
          'a' => { 'type' => 'var', 'name' => 'level' },
          'b' => { 'type' => 'num', 'value' => 20 }
        }
        expect(described_class.valid_ast?(node)).to be true
      end

      it 'rejects call2 with unknown fn' do
        node = {
          'type' => 'call2', 'fn' => 'pow',
          'a' => { 'type' => 'num', 'value' => 2 },
          'b' => { 'type' => 'num', 'value' => 3 }
        }
        expect(described_class.valid_ast?(node)).to be false
      end

      it 'rejects an unknown type' do
        expect(described_class.valid_ast?({ 'type' => 'evil', 'payload' => 'x' })).to be false
      end

      it 'rejects a non-hash' do
        expect(described_class.valid_ast?('not a hash')).to be false
        expect(described_class.valid_ast?(nil)).to be false
      end

      it 'rejects a tree exceeding depth 20' do
        # Build a deeply-nested neg chain: neg(neg(neg(...(var)...))) with 21 levels
        deep = { 'type' => 'var', 'name' => 'level' }
        21.times { deep = { 'type' => 'neg', 'operand' => deep } }
        expect(described_class.valid_ast?(deep)).to be false
      end

      it 'rejects a node with a missing required key' do
        expect(described_class.valid_ast?({ 'type' => 'binop', 'op' => '+',
                                            'left' => { 'type' => 'num', 'value' => 1 } })).to be false
      end
    end

    describe '#evaluate_for' do
      # These examples verify raw AST evaluation, independent of clamping, so they
      # disable clamp (the factory weight is 0, which would otherwise clamp every
      # result to 0). Clamping itself is covered in '#evaluate_for clamping' below.
      let(:config) do
        build(:course_gradebook_level_config, course: course, enabled: true, clamp: false)
      end

      it 'evaluates a num node (constant formula)' do
        config.formula_ast = { 'type' => 'num', 'value' => 5.0 }
        expect(config.evaluate_for(level: 10)).to eq(5.0)
      end

      it 'evaluates a var node (returns the level)' do
        config.formula_ast = { 'type' => 'var', 'name' => 'level' }
        expect(config.evaluate_for(level: 15)).to eq(15.0)
      end

      it 'evaluates a binop multiply: level * 0.5' do
        config.formula_ast = {
          'type' => 'binop', 'op' => '*',
          'left' => { 'type' => 'var', 'name' => 'level' },
          'right' => { 'type' => 'num', 'value' => 0.5 }
        }
        expect(config.evaluate_for(level: 20)).to be_within(0.001).of(10.0)
      end

      it 'evaluates a call2 min: min(level, 20) * 0.5' do
        config.formula_ast = {
          'type' => 'binop', 'op' => '*',
          'left' => {
            'type' => 'call2', 'fn' => 'min',
            'a' => { 'type' => 'var', 'name' => 'level' },
            'b' => { 'type' => 'num', 'value' => 20 }
          },
          'right' => { 'type' => 'num', 'value' => 0.5 }
        }
        expect(config.evaluate_for(level: 15)).to be_within(0.001).of(7.5)
        expect(config.evaluate_for(level: 25)).to be_within(0.001).of(10.0)
      end

      it 'evaluates floor: floor(level / 5)' do
        config.formula_ast = {
          'type' => 'call1', 'fn' => 'floor',
          'arg' => {
            'type' => 'binop', 'op' => '/',
            'left' => { 'type' => 'var', 'name' => 'level' },
            'right' => { 'type' => 'num', 'value' => 5 }
          }
        }
        expect(config.evaluate_for(level: 12)).to eq(2.0) # floor(12/5) = 2
      end

      it 'returns nil when the divisor is zero' do
        config.formula_ast = {
          'type' => 'binop', 'op' => '/',
          'left' => { 'type' => 'var', 'name' => 'level' },
          'right' => { 'type' => 'num', 'value' => 0 }
        }
        expect(config.evaluate_for(level: 5)).to be_nil
      end

      it 'returns nil only for the student whose level zeroes the divisor' do
        # 100 / level: undefined at level 0, defined elsewhere
        config.formula_ast = {
          'type' => 'binop', 'op' => '/',
          'left' => { 'type' => 'num', 'value' => 100 },
          'right' => { 'type' => 'var', 'name' => 'level' }
        }
        expect(config.evaluate_for(level: 0)).to be_nil
        expect(config.evaluate_for(level: 5)).to eq(20.0)
      end

      it 'returns nil when disabled' do
        config.enabled = false
        config.formula_ast = { 'type' => 'var', 'name' => 'level' }
        expect(config.evaluate_for(level: 10)).to be_nil
      end

      it 'returns nil when formula_ast is nil' do
        config.formula_ast = nil
        expect(config.evaluate_for(level: 10)).to be_nil
      end
    end

    describe '.upsert_for — formula_ast' do
      let(:valid_ast) do
        {
          'type' => 'binop', 'op' => '*',
          'left' => { 'type' => 'var', 'name' => 'level' },
          'right' => { 'type' => 'num', 'value' => 0.5 }
        }
      end

      it 'stores a valid formula_ast' do
        config = described_class.upsert_for(
          course: course,
          attrs: { enabled: true, formula: 'level * 0.5', formula_ast: valid_ast, weight: 10 }
        )
        expect(config.formula_ast).to eq(valid_ast)
      end

      it 'stores nil formula_ast when not provided' do
        config = described_class.upsert_for(
          course: course,
          attrs: { enabled: true, formula: 'level', weight: 5 }
        )
        expect(config.formula_ast).to be_nil
      end

      it 'raises RecordInvalid for a malformed formula_ast' do
        expect do
          described_class.upsert_for(
            course: course,
            attrs: { enabled: true, formula: 'level', formula_ast: { 'type' => 'evil' }, weight: 5 }
          )
        end.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
    describe '#evaluate_for clamping' do
      # formula 'level * 5'
      let(:times5) do
        { 'type' => 'binop', 'op' => '*',
          'left' => { 'type' => 'var', 'name' => 'level' },
          'right' => { 'type' => 'num', 'value' => 5 } }
      end
      # formula 'level - 5'
      let(:minus5) do
        { 'type' => 'binop', 'op' => '-',
          'left' => { 'type' => 'var', 'name' => 'level' },
          'right' => { 'type' => 'num', 'value' => 5 } }
      end

      it 'caps a value above the weight to the weight when clamp is on' do
        config = build(:course_gradebook_level_config, course: course, enabled: true,
                                                       formula: 'level * 5', formula_ast: times5,
                                                       weight: 3, clamp: true)
        expect(config.evaluate_for(level: 2)).to eq(3.0) # raw 10 -> 3
      end

      it 'floors a negative value to 0 when clamp is on' do
        config = build(:course_gradebook_level_config, course: course, enabled: true,
                                                       formula: 'level - 5', formula_ast: minus5,
                                                       weight: 10, clamp: true)
        expect(config.evaluate_for(level: 1)).to eq(0.0) # raw -4 -> 0
      end

      it 'leaves an in-range value unchanged when clamp is on' do
        config = build(:course_gradebook_level_config, course: course, enabled: true,
                                                       formula: 'level * 5', formula_ast: times5,
                                                       weight: 100, clamp: true)
        expect(config.evaluate_for(level: 1)).to eq(5.0)
      end

      it 'returns the raw value when clamp is off' do
        config = build(:course_gradebook_level_config, course: course, enabled: true,
                                                       formula: 'level * 5', formula_ast: times5,
                                                       weight: 3, clamp: false)
        expect(config.evaluate_for(level: 2)).to eq(10.0)
      end
    end

    describe '.upsert_for clamp' do
      it 'persists clamp false' do
        described_class.upsert_for(
          course: course,
          attrs: { enabled: true, formula: 'level',
                   formula_ast: { 'type' => 'var', 'name' => 'level' },
                   weight: 10, show: false, clamp: false }
        )
        expect(course.reload.gradebook_level_config.clamp).to be(false)
      end

      it 'defaults clamp to true when the key is omitted' do
        described_class.upsert_for(
          course: course,
          attrs: { enabled: false, formula: '', formula_ast: nil, weight: 0, show: false }
        )
        expect(course.reload.gradebook_level_config.clamp).to be(true)
      end
    end
  end
end
