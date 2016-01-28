# Dependency graph to handle and resolve the dependencies for the Conditional-Condition framework.
class Course::Conditional::ConditionalDependencyGraph
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

  # Initialize a topological sorted conditional dependency graph
  #
  # @param [Array<Object] conditionals Array of objects with acts_as_conditional
  # @raise [ArgumentError] When there is a cyclic dependency within the given conditionals
  def initialize(conditionals)
    @edges = EdgeSet.new

    begin
      @dependency_graph = TSort.tsort(each_node(conditionals), each_child)
    rescue TSort::Cyclic
      raise ArgumentError, 'Cyclic dependency detected in given conditionals'
    end
  end

  # Walk through the dependency graph and resolve all conditionals base on the given satisfied
  # conditions.
  #
  # @param [Array<Condition>] satisfied_conditions Conditions that have already been satisfied
  # @param [Course::CourseUser] course_user whose dependencies are to be resolved
  # @return [Set<Object>] All the resolved conditionals base on the given conditions
  def resolve(satisfied_conditions, course_user)
    resolved_conditions = Set.new(satisfied_conditions)
    resolved_conditionals = Set.new

    # Walk through the dependency graph to resolve the conditionals
    @dependency_graph.each do |conditional|
      # A conditional is resolved if all its specific conditions are resolved
      next unless resolved_conditions.superset?(Set.new(conditional.specific_conditions))
      resolved_conditionals << conditional

      # Add newly resolved conditions to cascade the effect of the resolved conditional
      resolved_conditions.merge(@edges.satisfied_edges_for(conditional, course_user))
    end

    resolved_conditionals
  end

  private

  def each_node(conditionals)
    conditionals.method(:each)
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
