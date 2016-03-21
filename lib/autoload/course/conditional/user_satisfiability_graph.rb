# Satisfiability graph to evaluate the satisfiability of the conditionals for a course user.
class Course::Conditional::UserSatisfiabilityGraph
  class EdgeSet < Hash
    def initialize
      super { |h, k| h[k] = Set.new }
    end

    def add(source, edge)
      self[source] << edge
    end

    def satisfied_edges_for(source, course_user)
      self[source].select { |c| c.satisfied_by?(course_user) }
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
  # @param [Array<Condition>] satisfied_conditions Conditions that have already been satisfied
  # @param [Course::CourseUser] course_user whose conditionals are to be evaluated
  # @return [Set<Object>] All the satisfied conditionals base on the given conditions
  def evaluate(satisfied_conditions, course_user)
    satisfied_conditions = Set.new(satisfied_conditions)
    satisfied_conditionals = Set.new

    # Walk through the graph to find all the satisfied conditionals
    @graph.each do |conditional|
      # A conditional is satisfied if all its specific conditions are satisfied
      next unless satisfied_conditions.superset?(Set.new(conditional.specific_conditions))
      satisfied_conditionals << conditional

      # Add newly satisfied conditions to cascade the effect of the satisfied conditional
      satisfied_conditions.merge(@edges.satisfied_edges_for(conditional, course_user))
    end

    satisfied_conditionals
  end

  # Return true if the destination node is reachable from the source node
  #
  # @param [Object] source Conditional node as the source
  # @param [Object] dest Conditional node as the destination
  # @return [Bool] true if the dest node is reachable from the source node
  def self.reachable?(source, dest)
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
        # Append the condition as an outgoing edge for the condition's dependent object
        @edges.add(condition.dependent_object, condition)

        b.call(condition.dependent_object) unless condition.dependent_object.nil?
      end
    end
  end
end
