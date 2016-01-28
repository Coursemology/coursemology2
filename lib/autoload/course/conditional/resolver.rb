# Resolver for solving Conditional's dependencies
class Course::Conditional::Resolver
  class << self
    # Topological sort the given conditionals to produce the conditionals' dependency graph
    #
    # @param [Array<Object] conditional Array of objects with acts_as_conditional
    # @return [Array<Object] Topologically sorted array of objects with acts_as_conditional
    # @raise [TSort::Cyclic] When there is a cyclic dependency in the conditionals
    def build_dependency_graph(conditionals)
      each_node = ->(&b) { conditionals.each(&b) }
      each_child = lambda do |conditional, &b|
        conditional.specific_conditions.map(&:dependent_objects).flatten.each(&b)
      end

      TSort.tsort(each_node, each_child)
    end

    # Walk through the dependency graph and resolve all conditionals base on the given satisfied
    # conditions.
    #
    # @param[Array<Object] dependency_graph The topologically sorted array of objects with
    #   acts_as_conditional
    # @param[Array<Condition] satisfied_conditions Conditions that have already been satisfied
    # @return [Set<Object] All the resolved conditionals base on the given conditions
    def resolve(dependency_graph, satisfied_conditions)
      resolved_conditions = Set.new(satisfied_conditions)
      resolved_conditionals = Set.new

      # Walk through the dependency graph to resolve the conditionals
      dependency_graph.each do |conditional|
        # A conditional is resolved if all its specific conditions are resolved
        if resolved_conditions.superset?(Set.new(conditional.specific_conditions))
          resolved_conditionals.add(conditional)

          # Add newly resolved conditions to cascade the effect of the resolved conditional
          # TODO(Xuanyi): Prevent multiple queries when accessing satisfy_conditions
          resolved_conditions.union(Set.new(conditional.satisfy_conditions))
        end
      end

      resolved_conditionals
    end
  end
end