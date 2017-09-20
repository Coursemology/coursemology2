require 'rails_helper'

RSpec.describe Course::Conditional::UserSatisfiabilityGraph do
  class DummyConditionalCondition < ApplicationRecord
    acts_as_conditional
    acts_as_condition
    attr_accessor :conditions
    attr_accessor :satisfied
    attr_accessor :id

    def specific_conditions
      @conditions
    end

    def dependent_object
      self
    end

    def satisfied_by?(_course_user)
      @satisfied
    end

    def permitted_for!(_course_user)
      @satisfied = true
    end

    def precluded_for!(_course_user)
      @satisfied = false
    end

    def satisfiable?
      true
    end

    def inspect
      "<#{@id}>"
    end

    def self.columns
      []
    end

    def self.build(conditions, id)
      dummy = new
      dummy.conditions = conditions
      dummy.satisfied = false
      dummy.id = id
      dummy
    end
  end

  def create_simple_graph
    #
    # A ---------
    #    |   |   |
    #    v   v   |
    #    C-->D   |
    #        |   |
    #        ->E<-
    # B -------^
    #
    a = DummyConditionalCondition.build([], 'A')
    b = DummyConditionalCondition.build([], 'B')
    c = DummyConditionalCondition.build([a], 'C')
    d = DummyConditionalCondition.build([a, c], 'D')
    e = DummyConditionalCondition.build([a, b, d], 'E')

    { A: a, B: b, C: c, D: d, E: e }
  end

  def create_cyclic_graph
    #
    # A ----> B ----> C
    # ^               |
    # |               |
    #  ----------------
    #
    a = DummyConditionalCondition.build([], 'A')
    b = DummyConditionalCondition.build([a], 'B')
    c = DummyConditionalCondition.build([b], 'C')
    a.conditions.append(c)

    { A: a, B: b, C: c }
  end

  def create_disconnected_graph
    #
    # A ----> B ----> C
    #
    # D ----> E ----> F
    #
    # G ----> H ----> I
    #
    a = DummyConditionalCondition.build([], 'A')
    b = DummyConditionalCondition.build([a], 'B')
    c = DummyConditionalCondition.build([b], 'C')

    d = DummyConditionalCondition.build([], 'D')
    e = DummyConditionalCondition.build([d], 'E')
    f = DummyConditionalCondition.build([e], 'F')

    g = DummyConditionalCondition.build([], 'G')
    h = DummyConditionalCondition.build([g], 'H')
    i = DummyConditionalCondition.build([h], 'I')

    { A: a, B: b, C: c, D: d, E: e, F: f, G: g, H: h, I: i }
  end

  describe '.build' do
    subject { Course::Conditional::UserSatisfiabilityGraph }

    context 'when dependencies do not contain cycle' do
      let(:simple_graph) { create_simple_graph }

      it 'builds satisfiability graph' do
        expect(subject.new(simple_graph.values)).
          to be_a(Course::Conditional::UserSatisfiabilityGraph)
      end
    end

    context 'when the dependencies contains cycle' do
      let(:cyclic_graph) { create_cyclic_graph }

      it 'raise ArgumentError' do
        expect { subject.new(cyclic_graph.values) }.to raise_error(ArgumentError)
      end
    end
  end

  describe '.reachable?' do
    let(:simple_graph) { create_simple_graph }
    let(:condition_z)  { DummyConditionalCondition.build([], 'Z') }

    subject { Course::Conditional::UserSatisfiabilityGraph }

    context 'when a path exist between the given conditionals' do
      context 'when all conditions have dependent object' do
        it 'returns true' do
          expect(subject.reachable?(simple_graph[:A], simple_graph[:E])).to be_truthy
        end
      end

      context 'when one of the conditions in the path do not have any dependent object' do
        it 'returns true' do
          simple_graph[:E].conditions.unshift(condition_z)

          expect(condition_z).to receive(:dependent_object).and_return(nil)
          expect(subject.reachable?(simple_graph[:A], simple_graph[:E])).to be_truthy
        end
      end
    end

    context 'when no path exist between the given conditionals' do
      context 'when all conditions have dependent object' do
        it 'returns false' do
          expect(subject.reachable?(simple_graph[:E], simple_graph[:A])).to be_falsey
        end
      end

      context 'when one of the conditions evaluated do not have any dependent object' do
        it 'returns false' do
          simple_graph[:A].conditions.unshift(condition_z)

          expect(condition_z).to receive(:dependent_object).and_return(nil)
          expect(subject.reachable?(simple_graph[:E], simple_graph[:A])).to be_falsey
        end
      end
    end
  end

  describe '#evaluate' do
    def check_evaluated_result(graph, satisfied)
      graph.values.index { |v| v.satisfied != satisfied.include?(v) }.nil?
    end

    context 'simple graph' do
      let(:graph) do
        graph = create_simple_graph
        graph.each { |_, v| allow(v).to receive(:satisfied_by?).and_return(false) }
        graph
      end

      subject { Course::Conditional::UserSatisfiabilityGraph.new(graph.values) }

      context 'when satisfied conditional do not satisfied additional conditions' do
        it 'permits only conditionals with no condition' do
          conditions = subject.evaluate(double)
          expect(check_evaluated_result(graph, [graph[:A], graph[:B]])).to be_truthy
          expect(conditions).to be_empty
        end
      end

      context 'when satisfying A satisfied additional conditions' do
        it 'permits only conditionals that have been satisfied' do
          allow(graph[:A]).to receive(:satisfied_by?).and_call_original
          conditions = subject.evaluate(double)
          expect(check_evaluated_result(graph, [graph[:A], graph[:B], graph[:C]])).to be_truthy
          expect(conditions).to contain_exactly(graph[:A])
        end
      end

      context 'when satisfied conditional satisfied additional conditions' do
        it 'permits all conditionals' do
          graph.each { |_, v| allow(v).to receive(:satisfied_by?).and_call_original }
          conditions = subject.evaluate(double)
          expect(check_evaluated_result(graph, graph.values)).to be_truthy
          expect(conditions).to contain_exactly(graph[:A], graph[:B], graph[:C], graph[:D])
        end
      end

      context 'when satisfied conditionals become unsatisfied' do
        it 'precludes the newly unsatisfied conditionals' do
          # Set C to be satisfied originally
          graph[:C].satisfied = true
          graph[:D].satisfied = true
          conditions = subject.evaluate(double)
          expect(check_evaluated_result(graph, [graph[:A], graph[:B]])).to be_truthy
          expect(conditions).to be_empty
        end
      end
    end

    context 'disconnected graph' do
      let(:graph) do
        graph = create_disconnected_graph
        graph.each { |_, v| allow(v).to receive(:satisfied_by?).and_return(false) }
        graph
      end

      subject { Course::Conditional::UserSatisfiabilityGraph.new(graph.values) }

      context 'when satisfied conditional do not satisfied additional conditions' do
        it 'permits only conditionals with no condition' do
          conditions = subject.evaluate(double)
          expect(check_evaluated_result(graph, [graph[:A], graph[:D], graph[:G]])).to be_truthy
          expect(conditions).to be_empty
        end
      end

      context 'when satisfying A & D satisfied additional conditions' do
        it 'permits only conditionals that have been satisfied' do
          allow(graph[:A]).to receive(:satisfied_by?).and_call_original
          allow(graph[:D]).to receive(:satisfied_by?).and_call_original
          conditions = subject.evaluate(double)
          expect(check_evaluated_result(graph, [graph[:A], graph[:B], graph[:D], graph[:E],
                                                graph[:G]])).to be_truthy
          expect(conditions).to contain_exactly(graph[:A], graph[:D])
        end
      end

      context 'when satisfying A & D & G satisfied additional conditions' do
        it 'permits each disconnected components up to level 2' do
          allow(graph[:A]).to receive(:satisfied_by?).and_call_original
          allow(graph[:D]).to receive(:satisfied_by?).and_call_original
          allow(graph[:G]).to receive(:satisfied_by?).and_call_original
          conditions = subject.evaluate(double)
          expect(check_evaluated_result(graph, [graph[:A], graph[:B], graph[:D], graph[:E],
                                                graph[:G], graph[:H]])).to be_truthy
          expect(conditions).to contain_exactly(graph[:A], graph[:D], graph[:G])
        end
      end

      context 'when all cascading conditions are satisfied by user in component A & D' do
        it 'permits all conditional in component A & D and conditional H' do
          allow(graph[:A]).to receive(:satisfied_by?).and_call_original
          allow(graph[:B]).to receive(:satisfied_by?).and_call_original
          allow(graph[:D]).to receive(:satisfied_by?).and_call_original
          allow(graph[:E]).to receive(:satisfied_by?).and_call_original
          conditions = subject.evaluate(double)
          expect(check_evaluated_result(graph, [graph[:A], graph[:B], graph[:C], graph[:D],
                                                graph[:E], graph[:F], graph[:G]])).to be_truthy
          expect(conditions).to contain_exactly(graph[:A], graph[:B], graph[:D], graph[:E])
        end
      end
    end
  end
end
