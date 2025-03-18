# frozen_string_literal: true
class Course::Conditional::ConditionalSatisfiabilityEvaluationJob < ApplicationJob
  include TrackableJob

  protected

  # Performs conditional satisfiability evaluation for the given course user.
  #
  # @param [String|nil] redirect_to_path The path to be redirected after the conditionals are
  #   evaluated.
  # @param [CourseUser] course_user The course user with the conditionals to be evaluated.
  def perform_tracked(course_user, redirect_to_path = nil)
    instance = Course.unscoped { course_user.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Conditional::ConditionalSatisfiabilityEvaluationService.evaluate(course_user)
    end

    redirect_to redirect_to_path
  end
end
