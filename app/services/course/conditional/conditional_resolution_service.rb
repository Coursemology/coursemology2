class Course::Conditional::ConditionalResolutionService
  class << self
    # Resolve the conditionals for the given course user
    #
    # @param [CourseUser] course_user The course user with conditionals to be resolved
    delegate :resolve, to: :new
  end

  # Resolve the conditionals for the given course user
  #
  # @param [CourseUser] course_user The course user with conditionals to be resolved
  def resolve(course_user)
    @course_user = course_user
    @course = course_user.course

    # Resolve conditionals for the user
    resolved_conditionals = conditional_graph.resolve(satisfied_conditions, @course_user)

    # Update the user with the resolved conditionals
    update_conditionals(resolved_conditionals)
  end

  private

  # Finds all the conditions that are satisfied by the course user
  def satisfied_conditions
    # TODO: Invalidate and replace current cache with the newly satisfied_condition
    Course::Condition.includes(:actable).where(course: @course).
      select { |c| c.satisfied_by?(@course_user) }.
      map(&:specific)
  end

  # Retrieve the conditional graph for the given course
  def conditional_graph
    # TODO: Retrieve conditional graph from cache
    Course::Conditional::ConditionalDependencyGraph.new(
      Course::Condition.conditionals_for(@course))
  end

  # Update the conditionals for the course user base on the given resolved conditionals
  def update_conditionals(conditionals)
    # TODO: To be replace with conditional's API for adding and removing conditionals
    conditionals
  end
end
