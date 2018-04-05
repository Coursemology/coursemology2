# frozen_string_literal: true
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

    update_conditions(satisfiability_graph.evaluate(@course_user))
  end

  private

  # Retrieve the satisfiability graph for the given course
  def satisfiability_graph
    # TODO: Retrieve graph from cache
    Course::Conditional::UserSatisfiabilityGraph.new(
      Course::Condition.conditionals_for(@course)
    )
  end

  def update_conditions(_satisfied_conditions)
    # Call course user API to update the cache for the satisfied conditions
  end
end
