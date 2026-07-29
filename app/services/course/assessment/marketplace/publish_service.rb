# frozen_string_literal: true

# Publishes an assessment to the marketplace (copy-on-publish, design V2/§5.1): (re)activate the
# listing, capture provenance, snapshot the authoring assessment into the hidden container course,
# and point `current_version` at the snapshot. `.publish` cuts v1 on first publish only — re-listing
# an already-versioned listing does not cut a version; `.publish_new_version` is that explicit action.
class Course::Assessment::Marketplace::PublishService # rubocop:disable Metrics/ClassLength
  # @param [Course::Assessment] assessment the source assessment being published
  # @param [User] publisher the user triggering the publish
  # @return [Course::Assessment::Marketplace::Listing]
  def self.publish(assessment, publisher)
    new(assessment, publisher).publish
  end

  # Idempotent single-listing version cut, reused by the backfill. No-op (returns the
  # existing version) if the listing already has one.
  # @param [Course::Assessment::Marketplace::Listing] listing an already-published listing
  # @param [User] publisher
  # @return [Course::Assessment::Marketplace::ListingVersion]
  def self.ensure_first_version!(listing, publisher)
    # An orphaned listing has no authoring copy to snapshot from; there is nothing to cut and
    # nothing to repair here (the fork-from-latest-snapshot path is a later slice).
    return nil if listing.authoring_assessment.nil?

    new(listing.authoring_assessment, publisher).ensure_first_version!(listing)
  end

  # Deliberate version cut (design §5.1). Snapshots whatever the authoring copy currently is into
  # the container as version N+1 and advances `current_version`. Prior snapshots are retained —
  # they are what Phase-3 comments and contributions will anchor to.
  #
  # There is deliberately no content-diff gating: `Course::Assessment#updated_at` does not track
  # content changes, and walking the object graph misses edits below any fixed depth and misses
  # deletions entirely (app/CLAUDE.md). The publisher decides when to cut.
  #
  # @param [Course::Assessment::Marketplace::Listing] listing
  # @param [User] publisher
  # @return [Course::Assessment::Marketplace::ListingVersion]
  def self.publish_new_version(listing, publisher)
    raise ArgumentError, 'cannot cut a version from an orphaned listing' if listing.authoring_assessment.nil?

    new(listing.authoring_assessment, publisher).cut_next_version!(listing)
  end

  # One-time backfill: version every published, version-less listing and stamp
  # `adopted_version = 1` on its version-less adoptions. Idempotent.
  # @return [void]
  def self.backfill_all!
    ActsAsTenant.without_tenant do
      # Keying idempotency on the absence of any version — not on a nil `current_version_id` — makes
      # reruns safe; in production the two are equivalent, since a version is only ever created
      # together with `current_version`. `where.not(authoring_assessment_id: nil)` skips orphans:
      # without it the backfill raises partway through and leaves the rest unversioned.
      Course::Assessment::Marketplace::Listing.published.
        where.not(authoring_assessment_id: nil).
        where.missing(:versions).find_each do |listing|
        version = ensure_first_version!(listing, listing.publisher)
        next if version.nil?

        listing.adoptions.where(adopted_version_at: nil).
          update_all(adopted_version_at: version.published_at)
      end
    end
    nil
  end

  # One-time backfill for `source_instance`: read it off the surviving source course. Idempotent —
  # only NULL rows are touched, so a rerun cannot overwrite a captured value.
  #
  # A listing that is already orphaned has no `source_course_id` to read and is left NULL on purpose;
  # nothing else on the row identifies its origin instance (the snapshots live in the preview
  # instance, and a publisher can belong to several instances).
  # @return [void]
  def self.backfill_source_instances!
    ActsAsTenant.without_tenant do
      Course::Assessment::Marketplace::Listing.
        where(source_instance_id: nil).where.not(source_course_id: nil).
        includes(:source_course).find_each do |listing|
          # `update_columns` deliberately skips validations and callbacks, matching the sibling
          # provenance backfill: this is a pure data fill and must neither stamp `updated_at` nor
          # trip userstamp on rows whose creator context is long gone.
          listing.update_columns(source_instance_id: listing.source_course.instance_id)
        end
    end
    nil
  end

  def initialize(assessment, publisher)
    @assessment = assessment
    @publisher = publisher
  end

  # @return [Course::Assessment::Marketplace::Listing]
  def publish
    with_publish_context do
      listing = activate_listing
      cut_first_version!(listing) if listing.current_version_id.nil?
      listing
    end
  end

  # @return [Course::Assessment::Marketplace::ListingVersion]
  def ensure_first_version!(listing)
    return listing.current_version if listing.current_version_id

    with_publish_context do
      capture_provenance(listing)
      listing.save!
      cut_first_version!(listing)
    end
    listing.current_version
  end

  # @param [Course::Assessment::Marketplace::Listing] listing
  # @return [Course::Assessment::Marketplace::ListingVersion]
  def cut_next_version!(listing)
    with_publish_context do
      snapshot = snapshot_into_container(@assessment)
      # One instant, written to both rows. Two `Time.zone.now` calls would let the version row and
      # the listing disagree by milliseconds — and different surfaces read different ones.
      published_at = Time.zone.now
      version = listing.versions.create!(published_at: published_at, assessment: snapshot,
                                         published_by: @publisher,
                                         creator: @publisher, updater: @publisher)
      listing.update!(current_version: version, last_published_at: published_at)
      version
    end
  end

  private

  # Runs the publish body without a tenant (the container lives in the dedicated preview
  # instance, never the caller's; callers may be scoped to any instance) and with the stamper
  # set so nested creator/updater resolve on the listing, version, and snapshot copy.
  def with_publish_context(&block)
    ActsAsTenant.without_tenant do
      User.with_stamper(@publisher) do
        Course::Assessment::Marketplace::Listing.transaction(&block)
      end
    end
  end

  # @return [Course::Assessment::Marketplace::Listing]
  def activate_listing
    listing = Course::Assessment::Marketplace::Listing.find_or_initialize_by(authoring_assessment: @assessment)
    now = Time.zone.now
    listing.published = true
    listing.first_published_at ||= now
    listing.last_published_at = now
    listing.publisher ||= @publisher
    capture_provenance(listing)
    listing.save!
    listing
  end

  # Denormalized so the identity survives origin-course deletion (design §3.2): the course row is what
  # gets deleted, so its title is copied rather than read through `source_course`.
  def capture_provenance(listing)
    course = @assessment.course
    listing.source_course ||= course
    listing.source_instance ||= course.instance
    listing.source_course_name ||= course.title
    listing.fallback_maintainer ||= course.course_users.find_by(role: :owner)&.user
  end

  # `published_at` is the listing's first-publication date rather than the moment of the cut: when v1
  # is cut, the listing's first publication is when its content became available. Baking it in here is
  # what removed the read-time v1 special case on ListingVersion.
  def cut_first_version!(listing)
    snapshot = snapshot_into_container(listing.authoring_assessment)
    version = listing.versions.create!(published_at: listing.first_published_at || Time.zone.now,
                                       assessment: snapshot, published_by: @publisher,
                                       creator: @publisher, updater: @publisher)
    listing.update!(current_version: version)
    version
  end

  # The snapshot is simultaneously the row previewers attempt hands-on — see
  # PreviewContainerService. Its immutability is enforced by the container's `preview` freeze, not
  # by convention. `duplicate_objects` performs no ability checks, so the freeze cannot block the
  # publish that populates the container.
  #
  # @return [Course::Assessment] the immutable snapshot living in the container course
  def snapshot_into_container(assessment)
    container = Course::Assessment::Marketplace::PreviewContainerService.container_course
    copy = Course::Duplication::ObjectDuplicationService.duplicate_objects(
      assessment.course, container, assessment, current_user: @publisher
    )
    reparent_into_container_tab(copy, container)
    # A published snapshot is a standalone assessment, not a link-sibling of the origin. See
    # Course::Assessment#detach_from_link_tree!.
    copy.detach_from_link_tree!
    copy
  end

  def reparent_into_container_tab(copy, container)
    tab = container.assessment_categories.first.tabs.first
    return if copy.tab_id == tab.id

    copy.tab = tab
    copy.folder.parent = tab.category.folder
    copy.save!
  end
end
