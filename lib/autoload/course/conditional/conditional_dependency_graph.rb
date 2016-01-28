# Dependency graph to handle and resolve the dependencies for the Conditional-Condition framework.
class Course::Conditional::ConditionalDependencyGraph
  private_class_method :new

  def initialize(dependency_graph)
    @dependency_graph = dependency_graph
  end

  # Walk through the dependency graph and resolve all conditionals base on the given satisfied
  # conditions.
  #
  # @param[Array<Condition] satisfied_conditions Conditions that have already been satisfied
  # @return [Set<Object] All the resolved conditionals base on the given conditions
  def resolve(satisfied_conditions)
    resolved_conditions = Set.new(satisfied_conditions)
    resolved_conditionals = Set.new

    # Walk through the dependency graph to resolve the conditionals
    @dependency_graph.each do |conditional|
      # A conditional is resolved if all its specific conditions are resolved
      if resolved_conditions.superset?(Set.new(conditional.specific_conditions))
        resolved_conditionals.add(conditional)

        # Add newly resolved conditions to cascade the effect of the resolved conditional
        # TODO(Xuanyi): Reduce the number of queries in accessing satisfy_conditions
        resolved_conditions.union(Set.new(conditional.satisfy_conditions))
      end
    end

    resolved_conditionals
  end

  # Topological sort the given conditionals to produce the conditionals' dependency graph
  #
  # @param [Array<Object] conditionals Array of objects with acts_as_conditional
  # @return [ConditionalDependencyGraph] Topologically sorted conditional dependency graph
  # @raise [TSort::Cyclic] When there is a cyclic dependency within the given conditionals
  def self.build(conditionals)
    each_node = ->(&b) { conditionals.each(&b) }
    each_child = lambda do |conditional, &b|
      conditional.specific_conditions.map(&:dependent_objects).flatten.each(&b)
    end

    new(TSort.tsort(each_node, each_child))
  end
end