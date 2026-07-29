# frozen_string_literal: true
# The system admin's manual repair for an orphaned listing: rebuilds its authoring copy from the
# latest snapshot, so the listing can cut versions again.
#
# This is the FAILSAFE, not the ordinary path. Losing a source assessment normally re-points the
# listing inside the destroy transaction (`Course::Assessment#repoint_marketplace_listing_authoring`),
# which is what keeps a listing from ever being observably orphaned. An orphan therefore means that
# callback was bypassed (a raw delete leaving `fk_caml_authoring_assessment_id` to null the column)
# and this is how an admin puts it right without a console.
#
# A job rather than an inline controller call for the reason adoption's `DuplicationJob` is one:
# duplicating a large assessment can outlast a request. The re-point pays that cost inline only
# because a clone that must precede a destroy cannot be deferred.
#
# The clone itself lives in `RestoreAuthoringService`, shared with the re-point, so a hand-repaired
# listing is indistinguishable from an automatically re-pointed one.
class Course::Assessment::Marketplace::RestoreAuthoringJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  queue_as :duplication

  protected

  def perform_tracked(listing_id, options = {})
    current_user = options[:current_user]
    ActsAsTenant.without_tenant do
      listing = Course::Assessment::Marketplace::Listing.find(listing_id)
      # Re-checked here rather than trusting the controller's guard: a republish restores an authoring
      # copy on its own, and it can land between enqueue and perform. Completing rather than erroring
      # is deliberate — the end state this job exists to reach is the one it found.
      return unless listing.orphaned?
      raise ArgumentError, 'listing has no version to restore from' if listing.current_version.nil?

      copy = Course::Assessment::Marketplace::RestoreAuthoringService.
             restore!(listing, current_user: current_user)
      redirect_to course_assessment_url(copy.course, copy, host: copy.course.instance.host)
    end
  end
end
