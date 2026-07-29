# frozen_string_literal: true
# Permanently deletes a marketplace listing together with the container snapshots it owns.
#
# Only ever allowed for a listing that is OFF the marketplace — orphaned or unlisted
# (`Listing#purgeable?`). A published listing must be unlisted (`published: false`) first, which is
# the reversible step.
#
# Purging destroys the listing's adoption rows too (`has_many :adoptions, dependent: :destroy`), but
# NOT the adopters' own duplicated assessments: `Adoption belongs_to :duplicated_assessment` carries a
# plain FK with no `dependent:` option, so destroying the adoption row never reaches into the
# destination course that assessment lives in. A purge must never touch another course's content.
#
# Purging an unlisted listing destroys the listing, its versions and their container snapshots, but
# NOT the authoring assessment those snapshots were copied from — so unlike the orphaned case the
# content survives and can be published afresh.
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
        @listing.destroy!
        destroy_snapshots(snapshot_ids)
      end
    end
    nil
  end

  private

  # ORDERING IS LOAD-BEARING, and it is why the ids are collected before the listing is destroyed:
  # `course_assessment_marketplace_listing_versions.assessment_id` carries a plain FK with no
  # `on_delete` (`fk_camlv_assessment_id`), so destroying a snapshot while its version row still
  # references it raises PG::ForeignKeyViolation. Destroy the listing first (its `versions` go with
  # it via `dependent: :destroy`), then the now-unreferenced snapshots.
  #
  # Skipping this second step would leak the snapshots: nothing else references them, so the
  # container course would grow forever with no reclaim path.
  def destroy_snapshots(snapshot_ids)
    Course::Assessment.where(id: snapshot_ids).each(&:destroy!)
  end
end
