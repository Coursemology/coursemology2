# frozen_string_literal: true
# Un-orphans a listing (design §5.3): duplicates the listing's latest snapshot into the marketplace's
# own container course as a NEW, editable assessment and points `authoring_assessment` at it, so
# `PublishService.publish_new_version` works again.
#
# The destination is the container, not a live course. Restore is not recovering some instructor's
# deleted assessment — it recovers the LISTING's ability to publish, from the marketplace's own
# snapshot. Putting the working copy anywhere else injects an assessment into a course somebody owns
# in order to fix a marketplace-owned problem.
#
# The copy is a NEW assessment sitting alongside the immutable snapshots — never one of them. Editing
# a snapshot in place would mutate a published version for every adopter with no version cut and make
# `adoptions.adopted_version` a lie.
#
# The container's content freeze does not obstruct this: `restrict_preview_course_content` is reached
# only via `define_non_admin_course_permissions`, guarded by `!user&.administrator?`
# (assessment_marketplace_ability_component.rb:21, :37), and every marketplace write is already
# admin-only. So an admin can edit the working copy and cut v(n+1) from it in place.
class Course::Assessment::Marketplace::RestoreAuthoringJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  queue_as :duplication

  protected

  def perform_tracked(listing_id, options = {})
    current_user = options[:current_user]
    # The container lives in the dedicated preview instance, never the caller's.
    ActsAsTenant.without_tenant do
      listing = Course::Assessment::Marketplace::Listing.find(listing_id)
      # Re-checked here and not only in the controller: the listing can be republished (which
      # restores an authoring copy on its own) between enqueue and perform, and this job is the only
      # writer of `authoring_assessment`. It is a column read on a loaded record.
      #
      # A listing that already has one is DONE, not failed — the end state this job exists to reach is
      # the one it found. That race became ordinary rather than exceptional when the rebuild started
      # being enqueued automatically on deletion (Course::Assessment#rebuild_marketplace_listing_authoring),
      # so it must not surface as a failed job to the admin who happens to be watching.
      return unless listing.orphaned?
      raise ArgumentError, 'listing is not restorable' unless listing.restorable?

      container = Course::Assessment::Marketplace::PreviewContainerService.container_course
      copy = restore_authoring_copy(listing, container, current_user)
      redirect_to course_assessment_url(container, copy, host: container.instance.host)
    end
  end

  private

  # @return [Course::Assessment] the fresh authoring copy
  def restore_authoring_copy(listing, container, current_user)
    # The SNAPSHOT, so the restored copy is exactly what the marketplace currently serves.
    source = listing.current_version.assessment
    User.with_stamper(current_user) do
      copy = Course::Duplication::ObjectDuplicationService.duplicate_objects(
        source.course, container, source, current_user: current_user
      )
      # The restored copy is a standalone assessment, not a link-sibling of the container snapshot
      # and of every adopter's copy. See Course::Assessment#detach_from_link_tree!.
      copy.detach_from_link_tree!
      # `source_course`, `source_course_name` and the source dates are deliberately left
      # UNTOUCHED. They record where the content originally came from and when it was taught —
      # historical facts. Restoring is a maintenance action on the listing, not a republish from a
      # new origin, so rewriting the provenance would falsify the listing's history.
      listing.update!(authoring_assessment: copy)
      copy
    end
  end
end
