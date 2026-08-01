# frozen_string_literal: true
# Permanently deletes a marketplace listing together with the container snapshots it owns.
#
# Only ever allowed for a listing that is OFF the marketplace — orphaned or unlisted
# (`Listing#purgeable?`). A published listing must be unlisted (`published: false`) first.
#
# Purging destroys the listing's adoption rows too (`has_many :adoptions, dependent: :destroy`), but
# NOT the adopters' own duplicated assessments: `Adoption belongs_to :duplicated_assessment` carries a
# plain FK with no `dependent:` option, so destroying the adoption row never reaches into the
# destination course that assessment lives in. A purge must never touch another course's content.
#
# Purging an unlisted listing destroys the listing, its versions and their container snapshots, but
# NOT an authoring assessment that lives in somebody's course — so the content survives and can be
# published afresh. An authoring copy the marketplace itself owns (one the re-point put in the
# container) has no owner left once the listing is gone, so that one is reclaimed with the snapshots.
class Course::Assessment::Marketplace::PurgeService
  # @param [Course::Assessment::Marketplace::Listing] listing
  # @raise [ArgumentError] if the listing is not purgeable
  # @return [void]
  def self.purge!(listing)
    new(listing).purge!
  end

  def initialize(listing)
    @listing = listing
  end

  # @return [void]
  def purge!
    raise ArgumentError, 'only an orphaned or unlisted listing can be permanently deleted' unless
      @listing.purgeable?

    # The snapshots live in the hidden container course, which sits in the dedicated preview
    # instance — never the caller's.
    ActsAsTenant.without_tenant do
      Course::Assessment::Marketplace::Listing.transaction do
        snapshot_ids = @listing.versions.pluck(:assessment_id)
        # Read before the destroy: `marketplace_hosted?` needs the pointer this is about to remove.
        container_copy_id = @listing.authoring_assessment_id if @listing.marketplace_hosted?
        @listing.destroy!
        destroy_container_assessments(snapshot_ids + [container_copy_id].compact)
      end
    end
    nil
  end

  private

  # Ordering is load-bearing, and it is why the ids are collected before the listing is destroyed:
  # `course_assessment_marketplace_listing_versions.assessment_id` carries a plain FK with no
  # `on_delete`, so destroying a snapshot while its version row still references it raises
  # PG::ForeignKeyViolation. Destroy the listing first (its `versions` cascade), then the assessments.
  #
  # Skipping this second step would leak them: nothing else references a snapshot or a reclaimed
  # authoring copy, so the container course would grow forever with no reclaim path.
  def destroy_container_assessments(assessment_ids)
    Course::Assessment.where(id: assessment_ids).each(&:destroy!)
  end
end
