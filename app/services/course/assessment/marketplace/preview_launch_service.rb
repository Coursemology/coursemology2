# frozen_string_literal: true
# Attaches a previewer to the marketplace sandbox and returns the absolute attempt URL for the
# listing's served snapshot, on the preview host. Idempotent on (listing, user).
#
# Preconditions: the listing is published and has a `current_version`. `ListingsController
# #launch_preview` enforces both before calling — a listing with no snapshot has nothing to rehearse.
#
# This service performs NO authorization and must not. It runs with system privileges deliberately: the
# `preview` content-freeze (Course::AssessmentMarketplaceAbilityComponent) would otherwise block the very
# provisioning it depends on. The caller authorizes — see ListingsController#launch_preview.
class Course::Assessment::Marketplace::PreviewLaunchService
  class << self
    # Route helpers are not available on a plain class by default; delegate rather than include the
    # whole url_helpers module, matching `CikgoTaskCompletionConcern#submission_url`'s approach.
    delegate :course_assessment_attempt_path, to: 'Rails.application.routes.url_helpers'

    def launch(listing, user)
      ActsAsTenant.without_tenant do
        instance = Course::Assessment::Marketplace::PreviewContainerService.preview_instance
        course = Course::Assessment::Marketplace::PreviewContainerService.container_course
        snapshot = listing.current_version.assessment
        ensure_enrolment(user, instance, course)
        attempt_url(instance, course, snapshot)
      end
    end

    private

    def ensure_enrolment(user, instance, course)
      ActsAsTenant.with_tenant(instance) do
        InstanceUser.find_or_create_by!(user: user) { |instance_user| instance_user.role = :normal }
      end

      course.course_users.find_or_create_by!(user: user) do |course_user|
        course_user.name = user.name
        course_user.role = :manager
        course_user.creator = User.system
        course_user.updater = User.system
      end
    end

    def attempt_url(instance, course, snapshot)
      "#{instance.redirect_uri}#{course_assessment_attempt_path(course, snapshot)}"
    end
  end
end
