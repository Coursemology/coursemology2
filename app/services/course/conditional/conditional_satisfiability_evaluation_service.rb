class Course::Conditional::ConditionalSatisfiabilityEvaluationService
  class << self
    # Evaluate the satifisability of the conditionals for the given course user
    #
    # @param [CourseUser] course_user The course user with conditionals to be evaluated
    delegate :evaluate, to: :new
  end

  # Evaluate the satisfiability of the conditionals for the given course user
  #
  # @param [CourseUser] course_user The course user with conditionals to be evaluated
  def evaluate(course_user)
    @course_user = course_user
    @course = course_user.course

    # Evaluate conditionals for the user
    satisfied_conditionals = satisfiability_graph.evaluate(satisfied_conditions, @course_user)

    # Update the user with the satisfied conditionals
    update_conditionals(satisfied_conditionals)
  end

  private

  # Finds all the conditions that are satisfied by the course user
  def satisfied_conditions
    # TODO: Invalidate and replace current cache with the newly satisfied_condition
    Course::Condition.includes(:actable).where(course: @course).
      select { |c| c.satisfied_by?(@course_user) }.
      map(&:specific)
  end

  # Retrieve the satisfiability graph for the given course
  def satisfiability_graph
    # TODO: Retrieve graph from cache
    Course::Conditional::UserSatisfiabilityGraph.new(
      Course::Condition.conditionals_for(@course))
  end

  # Update the conditionals for the course user base on the given satisfied conditionals
  def update_conditionals(conditionals)
    # TODO: To be replace with conditional's API for adding and removing conditionals
    conditionals
  end
end
