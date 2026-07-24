# frozen_string_literal: true

# Publishes an assessment to the marketplace and cuts version 1 (copy-on-publish,
# design V2/§5.1): (re)activate the listing, capture provenance, snapshot the source
# assessment into the hidden container course, and point `current_version` at the
# snapshot. This slice cuts ONLY the first version — deliberate "publish new version"
# is Slice 4. No rename, no read repoint here.
class Course::Assessment::Marketplace::PublishService
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
    new(listing.assessment, publisher).ensure_first_version!(listing)
  end

  # One-time backfill: version every published, version-less listing and stamp
  # `adopted_version = 1` on its version-less adoptions. Idempotent.
  # @return [void]
  def self.backfill_all!
    ActsAsTenant.without_tenant do
      # Never-versioned published listings only. Keying idempotency on the absence of
      # any version (not just a nil `current_version_id`) makes reruns safe and avoids
      # re-cutting v1 for a listing that already has one — in production the two are
      # equivalent, since a version is only ever created together with `current_version`.
      Course::Assessment::Marketplace::Listing.published.where.missing(:versions).find_each do |listing|
        ensure_first_version!(listing, listing.publisher)
        listing.adoptions.where(adopted_version: nil).update_all(adopted_version: 1)
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

  private

  # Runs the publish body without a tenant (the container lives in the default
  # instance; callers may be scoped to any instance) and with the stamper set so
  # nested creator/updater resolve on the listing, version, and snapshot copy.
  def with_publish_context(&block)
    ActsAsTenant.without_tenant do
      User.with_stamper(@publisher) do
        Course::Assessment::Marketplace::Listing.transaction(&block)
      end
    end
  end

  # @return [Course::Assessment::Marketplace::Listing]
  def activate_listing
    listing = Course::Assessment::Marketplace::Listing.find_or_initialize_by(assessment: @assessment)
    now = Time.zone.now
    listing.published = true
    listing.first_published_at ||= now
    listing.last_published_at = now
    listing.publisher ||= @publisher
    capture_provenance(listing)
    listing.save!
    listing
  end

  # Denormalized so the identity survives origin-course deletion (design §3.2).
  # Coursemology's Course models only a title (no course-code / academic-period
  # concept), so `source_course_code` / `source_academic_period` are reserved-nil.
  def capture_provenance(listing)
    course = @assessment.course
    listing.source_course ||= course
    listing.source_course_name ||= course.title
    listing.fallback_maintainer ||= course.course_users.find_by(role: :owner)&.user
  end

  def cut_first_version!(listing)
    snapshot = snapshot_into_container(listing.assessment)
    version = listing.versions.create!(version: 1, assessment: snapshot, published_by: @publisher,
                                       creator: @publisher, updater: @publisher)
    listing.update!(current_version: version)
    version
  end

  # @return [Course::Assessment] the immutable snapshot living in the container course
  def snapshot_into_container(assessment)
    container = Course::Assessment::Marketplace.container
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
