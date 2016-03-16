class Course::Conditional::ConditionalResolutionJob < ApplicationJob
  include TrackableJob

  protected

  # Performs conditional resolution for the given course user.
  #
  # @param [String|nil] redirect_to_path The path to be redirected after the conditionals are
  #   resolved.
  # @param [CourseUser] course_user The course user with the conditionals to be resolved.
  def perform_tracked(course_user, redirect_to_path = nil)
    instance = Course.unscoped { course_user.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Conditional::ConditionalResolutionService.resolve(course_user)
    end

    redirect_to redirect_to_path
  end
end
