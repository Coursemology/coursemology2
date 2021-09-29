# frozen_string_literal: true
class Course::Conditional::SatisfiabilityGraphBuildService
  class << self
    # Build and cache the satisfiability graph for the given course.
    #
    # @param [Course] course The course to build the satsifiability graph
    def build(course)
      # TODO: Cache the satisfiability graph
      new.build(course)
    end
  end

  # Build the satisfiability graph for the given course.
  #
  # @param [Course] course The course to build the satsifiability graph
  # @return [Course::Conditional::UserSatisfiabilityGraph] The satisfiability graph for the course
  def build(course)
    Course::Conditional::UserSatisfiabilityGraph.new(Course::Condition.conditionals_for(course))
  end
end
