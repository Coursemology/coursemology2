require 'rails_helper'

RSpec.describe Course::Conditional::ConditionalDependencyGraph do
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
    @A = DummyConditionalCondition.build([], 'A')
    @B = DummyConditionalCondition.build([], 'B')
    @C = DummyConditionalCondition.build([@A], 'C')
    @D = DummyConditionalCondition.build([@A, @C], 'D')
    @E = DummyConditionalCondition.build([@A, @B, @D], 'E')

    [@C, @A, @B, @E, @D]
  end

  def create_cyclic_graph
    #
    # A ----> B ----> C
    # ^               |
    # |               |
    #  ----------------
    #
    @A = DummyConditionalCondition.build([], 'A')
    @B = DummyConditionalCondition.build([@A], 'B')
    @C = DummyConditionalCondition.build([@B], 'C')
    @A.conditions.append(@C)

    [@B, @A, @C]
  end

  def create_disconnected_graph
    #
    # A ----> B ----> C
    #
    # D ----> E ----> F
    #
    # G ----> H ----> I
    #
    @A = DummyConditionalCondition.build([], 'A')
    @B = DummyConditionalCondition.build([@A], 'B')
    @C = DummyConditionalCondition.build([@B], 'C')

    @D = DummyConditionalCondition.build([], 'D')
    @E = DummyConditionalCondition.build([@D], 'E')
    @F = DummyConditionalCondition.build([@E], 'F')

    @G = DummyConditionalCondition.build([], 'G')
    @H = DummyConditionalCondition.build([@G], 'H')
    @I = DummyConditionalCondition.build([@H], 'I')

    [@B, @D, @E, @H, @G, @A, @I, @C, @F]
  end

  describe '.build' do
    subject { Course::Conditional::ConditionalDependencyGraph }

    context 'when dependencies do not contain cycle' do
      before(:each) do
        @simple_graph = create_simple_graph
      end

      it 'build dependency graph' do
        expect(subject.build(@simple_graph)).to be_instance_of(
                                                 Course::Conditional::ConditionalDependencyGraph)
      end
    end

    context 'when dependencies contains cycle' do
      before(:each) do
        @cyclic_graph = create_cyclic_graph
      end

      it 'raise ArgumentError' do
        expect{ subject.build(@cyclic_graph) }.to raise_error(ArgumentError)
      end
    end
  end

  describe '#resolve' do
    context 'simple graph' do
      before(:each) do
        @simple_graph = create_simple_graph
        allow_any_instance_of(DummyConditionalCondition)
          .to receive(:satisfied_by?).and_return(false)
      end

      subject { Course::Conditional::ConditionalDependencyGraph.build(@simple_graph) }

      context 'when resolved conditions do not resolve other conditions' do
        context 'when no conditions are satisfied initially' do
          it 'returns only conditionals with no condition' do
            expect(subject.resolve([], double)).to contain_exactly(@A, @B)
          end
        end

        context 'when condition A & B are satisfied initially' do
          it 'returns only conditionals that have been resolved' do
            expect(subject.resolve([@A, @B], double)).to contain_exactly(@A, @B, @C)
          end
        end

        context 'when all conditions are satisfied initially' do
          it 'returns all conditionals' do
            expect(subject.resolve(@simple_graph, double)).to match_array(@simple_graph)
          end
        end
      end

      context 'when resolved conditionals do resolve other conditions' do

        context 'when no conditions are satisfied initially' do
          context 'when conditions for A & B are satisfied by the user' do
            it 'returns conditionals up to C' do
              allow(@A).to receive(:satisfied_by?).and_return(true)
              allow(@B).to receive(:satisfied_by?).and_return(true)
              expect(subject.resolve([], double)).to contain_exactly(@A, @B, @C)
            end
          end

          context 'when all cascading conditions are satisfied by user'
            it 'returns all conditionals' do
              allow_any_instance_of(DummyConditionalCondition)
                .to receive(:satisfied_by?).and_return(true)
              expect(subject.resolve([], double)).to match_array(@simple_graph)
            end
          end
      end

      # The case where:
      # 1) A conditional x is manually resolved in the system despite not fulfilling the requirements.
      # 2) Some conditions xc that depends on the conditional are satisfied
      # Resolve will not return the manually resolved conditional x since its conditions are not
      # satisfied. However, conditionals that depends on the conditions xc will still be resolved.
      context 'when condition D is satisfied initially' do
        context 'when conditions for A & B are satisfied by the user' do
          it 'returns all conditionals except for D' do
            allow(@A).to receive(:satisfied_by?).and_return(true)
            allow(@B).to receive(:satisfied_by?).and_return(true)
            expect(subject.resolve([@D], double)).to contain_exactly(@A, @B, @C, @E)
          end
        end
      end
    end

    context 'disconnected graph' do
      before(:each) do
        @disconnected_graph = create_disconnected_graph
        allow_any_instance_of(DummyConditionalCondition)
          .to receive(:satisfied_by?).and_return(false)
      end

      subject { Course::Conditional::ConditionalDependencyGraph.build(@disconnected_graph) }

      context 'when resolved conditions do not resolve other conditions' do
        context 'when no conditions are satisfied initially' do
          it 'returns only conditionals with no condition' do
            expect(subject.resolve([], double)).to contain_exactly(@A, @D, @G)
          end
        end

        context 'when condition A & D are satisfied initially' do
          it 'returns only conditionals that have been resolved' do
            expect(subject.resolve([@A, @D], double)).to contain_exactly(@A, @B, @D, @E, @G)
          end
        end
      end

      context 'when resolved conditionals do resolve other conditions' do

        context 'when no conditions are satisfied initially' do
          context 'when conditions for A, D & H are satisfied by the user' do
            it 'returns each disconnected components up to level 2' do
              allow(@A).to receive(:satisfied_by?).and_return(true)
              allow(@D).to receive(:satisfied_by?).and_return(true)
              allow(@G).to receive(:satisfied_by?).and_return(true)
              expect(subject.resolve([], double)).to contain_exactly(@A, @B, @D, @E, @G, @H)
            end
          end

          context 'when all cascading conditions are satisfied by user in component A & D'
          it 'returns all conditional in component A & D and conditional H' do
            allow(@A).to receive(:satisfied_by?).and_return(true)
            allow(@B).to receive(:satisfied_by?).and_return(true)
            allow(@D).to receive(:satisfied_by?).and_return(true)
            allow(@E).to receive(:satisfied_by?).and_return(true)
            expect(subject.resolve([], double)).to contain_exactly(@A, @B, @C, @D, @E, @F, @G)
          end
        end
      end
    end
  end
end
