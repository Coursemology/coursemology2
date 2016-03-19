require 'rails_helper'

RSpec.describe Course::Conditional::UserSatisfiabilityGraph do
  class DummyConditionalCondition < ActiveRecord::Base
    acts_as_conditional
    acts_as_condition
    attr_accessor :conditions
    attr_accessor :id

    def specific_conditions
      @conditions
    end

    def dependent_object
      self
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

  describe '#evaluate' do
    context 'simple graph' do
      let(:graph) do
        graph = create_simple_graph
        graph.each { |_, v| allow(v).to receive(:satisfied_by?).and_return(false) }
        graph
      end

      subject { Course::Conditional::UserSatisfiabilityGraph.new(graph.values) }

      context 'when satisfied conditions do not satisfy other conditions' do
        context 'when no conditions are satisfied initially' do
          it 'returns only conditionals with no condition' do
            expect(subject.evaluate([], double)).to contain_exactly(graph[:A], graph[:B])
          end
        end

        context 'when condition A & B are satisfied initially' do
          it 'returns only conditionals that have been satsified' do
            expect(subject.evaluate([graph[:A], graph[:B]], double)).
              to contain_exactly(graph[:A], graph[:B], graph[:C])
          end
        end

        context 'when all conditions are satisfied initially' do
          it 'returns all conditionals' do
            expect(subject.evaluate(graph.values, double)).to match_array(graph.values)
          end
        end
      end

      context 'when satisfied conditionals do satisfy other conditions' do
        context 'when no conditions are satisfied initially' do
          context 'when conditions for A & B are satisfied by the user' do
            it 'returns conditionals up to C' do
              allow(graph[:A]).to receive(:satisfied_by?).and_return(true)
              allow(graph[:B]).to receive(:satisfied_by?).and_return(true)
              expect(subject.evaluate([], double)).
                to contain_exactly(graph[:A], graph[:B], graph[:C])
            end
          end

          context 'when all cascading conditions are satisfied by user' do
            it 'returns all conditionals' do
              graph.each { |_, v| allow(v).to receive(:satisfied_by?).and_return(true) }
              expect(subject.evaluate([], double)).to match_array(graph.values)
            end
          end
        end
      end

      # The case where:
      # 1) A conditional x is manually awarded in the system despite not fulfilling the
      #    requirements.
      # 2) Some conditions xc that depends on the conditional x are satisfied
      # The evaluation will not return the manually awarded conditional x since its conditions are
      # not satisfied. However, conditionals that depends on the conditions xc will still be
      # satisfied in the evaluation.
      context 'when condition D is satisfied initially' do
        context 'when conditions for A & B are satisfied by the user' do
          it 'returns all conditionals except for D' do
            allow(graph[:A]).to receive(:satisfied_by?).and_return(true)
            allow(graph[:B]).to receive(:satisfied_by?).and_return(true)
            expect(subject.evaluate([graph[:D]], double)).
              to contain_exactly(graph[:A], graph[:B], graph[:C], graph[:E])
          end
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

      context 'when satisfied conditions do not satisfy other conditions' do
        context 'when no conditions are satisfied initially' do
          it 'returns only conditionals with no condition' do
            expect(subject.evaluate([], double)).
              to contain_exactly(graph[:A], graph[:D], graph[:G])
          end
        end

        context 'when condition A & D are satisfied initially' do
          it 'returns only conditionals that have been satisfied' do
            expect(subject.evaluate([graph[:A], graph[:D]], double)).
              to contain_exactly(graph[:A], graph[:B], graph[:D], graph[:E], graph[:G])
          end
        end
      end

      context 'when satisfied conditionals do satisfy other conditions' do
        context 'when no conditions are satisfied initially' do
          context 'when conditions for A, D & H are satisfied by the user' do
            it 'returns each disconnected components up to level 2' do
              allow(graph[:A]).to receive(:satisfied_by?).and_return(true)
              allow(graph[:D]).to receive(:satisfied_by?).and_return(true)
              allow(graph[:G]).to receive(:satisfied_by?).and_return(true)
              expect(subject.evaluate([], double)).
                to contain_exactly(graph[:A], graph[:B], graph[:D], graph[:E], graph[:G], graph[:H])
            end
          end

          context 'when all cascading conditions are satisfied by user in component A & D' do
            it 'returns all conditional in component A & D and conditional H' do
              allow(graph[:A]).to receive(:satisfied_by?).and_return(true)
              allow(graph[:B]).to receive(:satisfied_by?).and_return(true)
              allow(graph[:D]).to receive(:satisfied_by?).and_return(true)
              allow(graph[:E]).to receive(:satisfied_by?).and_return(true)
              expect(subject.evaluate([], double)).
                to contain_exactly(graph[:A], graph[:B], graph[:C], graph[:D], graph[:E], graph[:F],
                                   graph[:G])
            end
          end
        end
      end
    end
  end
end
