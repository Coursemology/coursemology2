# Dependency graph to handle and resolve the dependencies for the Conditional-Condition framework.
class Course::Conditional::ConditionalDependencyGraph
  private_class_method :new

  def initialize(dependency_graph, edges)
    @dependency_graph = dependency_graph
    @edges = edges
  end

  # Walk through the dependency graph and resolve all conditionals base on the given satisfied
  # conditions.
  #
  # @param[Array<Condition] satisfied_conditions Conditions that have already been satisfied
  # @param[Course::CourseUser] course_user whose dependencies are to be resolved
  # @return [Set<Object] All the resolved conditionals base on the given conditions
  def resolve(satisfied_conditions, course_user)
    resolved_conditions = Set.new(satisfied_conditions)
    resolved_conditionals = Set.new

    # Walk through the dependency graph to resolve the conditionals
    @dependency_graph.each do |conditional|
      # A conditional is resolved if all its specific conditions are resolved
      if resolved_conditions.superset?(Set.new(conditional.specific_conditions))
        resolved_conditionals.add(conditional)

        # Add newly resolved conditions to cascade the effect of the resolved conditional
        resolved_conditions.merge(@edges[conditional].select { |c| c.satisfied_by?(course_user) })
      end
    end

    resolved_conditionals
  end

  # Topological sort the given conditionals to produce the conditionals' dependency graph
  #
  # @param [Array<Object] conditionals Array of objects with acts_as_conditional
  # @return [ConditionalDependencyGraph] Topologically sorted conditional dependency graph
  # @raise [ArgumentError] When there is a cyclic dependency within the given conditionals
  def self.build(conditionals)
    edges = Hash.new { |h, k| h[k] = Set.new }

    each_node = ->(&b) { conditionals.each(&b) }
    each_child = lambda do |conditional, &b|
      conditional.specific_conditions.each do |condition|
        # Append the condition as an outgoing edge for the condition's dependent object
        edges[condition.dependent_object].add(condition)

        b.call(condition.dependent_object) unless condition.dependent_object.nil?
      end
    end

    begin
      new(TSort.tsort(each_node, each_child), edges)
    rescue TSort::Cyclic
      raise ArgumentError.new('Cyclic dependency detected in given conditionals')
    end
  end
end
