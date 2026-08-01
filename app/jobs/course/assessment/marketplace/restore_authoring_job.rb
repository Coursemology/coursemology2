# frozen_string_literal: true
# Un-orphans a listing: duplicates the listing's latest snapshot into the marketplace's
# own container course as a NEW, editable assessment and points `authoring_assessment` at it, so the
# listing returns to the marketplace and `PublishService.publish_new_version` works again.
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
    # The SNAPSHOT, so the restored copy is exactly the content of the latest published version.
    source = listing.current_version.assessment
    User.with_stamper(current_user) do
      copy = Course::Duplication::ObjectDuplicationService.duplicate_objects(
        source.course, container, source, current_user: current_user
      )
      # `source_course` and `source_course_name` are deliberately left untouched: they record where
      # the content originally came from, a historical fact. Restoring is a maintenance action on the
      # listing, not a republish from a new origin, so rewriting provenance would falsify its history.
      listing.update!(authoring_assessment: copy)
      copy
    end
  end
end
