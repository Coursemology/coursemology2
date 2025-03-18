# frozen_string_literal: true
class Course::Conditional::CoursewideConditionalSatisfiabilityEvaluationJob < ApplicationJob
  DELTA = 1.0

  include TrackableJob

  protected

  # Performs conditional satisfiability evaluation for all users in the given course.
  #
  # @param [Course] course The course to evaluate the conditionals for.
  # @param [Time] latest_update_time The latest time that a similar job was enqueued.
  # @param [String|nil] redirect_to_path The path to be redirected after the conditionals are
  #   evaluated.
  def perform_tracked(course, latest_update_time, redirect_to_path = nil)
    # Only evaluate conditionals for latest enqueued job
    if (latest_update_time.to_f - course.conditional_satisfiability_evaluation_time.to_f).abs <= DELTA
      instance = Course.unscoped { course.instance }

      course.course_users.each do |course_user|
        ActsAsTenant.with_tenant(instance) do
          Course::Conditional::ConditionalSatisfiabilityEvaluationService.evaluate(course_user)
        end
      end
    end

    redirect_to redirect_to_path
  end
end
