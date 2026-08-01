# frozen_string_literal: true

# Publishes an assessment to the marketplace (copy-on-publish): (re)activate the
# listing, capture provenance, snapshot the authoring assessment into the hidden container course,
# and point `current_version` at the snapshot. `.publish` cuts v1 on first publish only — re-listing
# an already-versioned listing does not cut a version; `.publish_new_version` is that explicit action.
class Course::Assessment::Marketplace::PublishService
  # @param [Course::Assessment] assessment the source assessment being published
  # @param [User] publisher the user triggering the publish
  # @return [Course::Assessment::Marketplace::Listing]
  def self.publish(assessment, publisher)
    new(assessment, publisher).publish
  end

  # Deliberate version cut. Snapshots whatever the authoring copy currently is into
  # the container as a new version and advances `current_version`. Prior snapshots are retained —
  # they are what comments and contributions will anchor to.
  #
  # @param [Course::Assessment::Marketplace::Listing] listing
  # @param [User] publisher
  # @return [Course::Assessment::Marketplace::ListingVersion]
  def self.publish_new_version(listing, publisher)
    raise ArgumentError, 'cannot cut a version from an orphaned listing' if listing.authoring_assessment.nil?

    new(listing.authoring_assessment, publisher).cut_next_version!(listing)
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

  # Denormalized so the identity survives origin-course deletion: the course row is what
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
  # what removed the read-time v1 special case on ListingVersion. `activate_listing` runs first and
  # always leaves the date set, so there is no nil to fall back from.
  def cut_first_version!(listing)
    snapshot = snapshot_into_container(listing.authoring_assessment)
    version = listing.versions.create!(published_at: listing.first_published_at,
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
