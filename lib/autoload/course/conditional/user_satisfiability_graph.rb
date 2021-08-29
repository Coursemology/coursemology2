# frozen_string_literal: true
# Satisfiability graph to evaluate the satisfiability of the conditionals for a course user.
class Course::Conditional::UserSatisfiabilityGraph
  class EdgeSet < Hash
    def initialize
      super { |h, k| h[k] = Set.new }
    end

    def add(source, edge)
      self[source] << edge
    end
  end

  # Initialize a topological sorted satisfiability graph.
  #
  # @param [Array<Object>] conditionals Array of objects with acts_as_conditional
  # @raise [ArgumentError] When there is a cyclic dependency within the given conditionals
  def initialize(conditionals)
    @edges = EdgeSet.new
    @nodes = conditionals

    begin
      @graph = TSort.tsort(each_node, each_child)
    rescue TSort::Cyclic
      raise ArgumentError, 'Cyclic dependency detected in given conditionals'
    end
  end

  # Walk through the graph to evaluate the satisfiability of the conditionals for the course user.
  #
  # @param [Course::CourseUser] course_user whose conditionals are to be evaluated
  # @return [Set<Object>] All the satisfied conditions after evaluation
  def evaluate(course_user)
    satisfied_conditions = Set.new

    # Walk through the graph to find all the satisfied conditionals
    @graph.each do |conditional|
      # Remove conditional if they are not available.
      unless conditional.satisfiable?
        conditional.precluded_for!(course_user)
        next
      end

      conditions = conditional.specific_conditions.select { |c| c.satisfied_by?(course_user) }
      satisfied_conditions.merge(Set.new(conditions))

      # A conditional is satisfied if all its specific conditions are satisfied
      satisfied = conditions.count == conditional.specific_conditions.count
      satisfied ? conditional.permitted_for!(course_user) : conditional.precluded_for!(course_user)
    end

    satisfied_conditions
  end

  # Return true if the destination node is reachable from the source node
  #
  # @param [Object] source Conditional node as the source
  # @param [Object] dest Conditional node as the destination
  # @return [Bool] true if the dest node is reachable from the source node
  def self.reachable?(source, dest)
    return false unless dest
    return true if source == dest

    dest.specific_conditions.index { |c| reachable?(source, c.dependent_object) }.present?
  end

  private

  def each_node
    @nodes.method(:each)
  end

  def each_child
    lambda do |conditional, &b|
      conditional.specific_conditions.each do |condition|
        dependent_object = condition.dependent_object
        # We only want conditionals as nodes in this graph. Not all dependent objects are conditionals.
        next unless conditional_object?(dependent_object)

        # Append the condition as an outgoing edge for the condition's dependent object
        @edges.add(dependent_object, condition)

        b.call(dependent_object)
      end
    end
  end

  def conditional_object?(object)
    object.singleton_class.include?(ActiveRecord::Base::ConditionalInstanceMethods)
  end
end
