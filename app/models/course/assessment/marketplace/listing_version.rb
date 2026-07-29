# frozen_string_literal: true
class Course::Assessment::Marketplace::ListingVersion < ApplicationRecord
  belongs_to :listing, class_name: 'Course::Assessment::Marketplace::Listing',
                       inverse_of: :versions
  belongs_to :assessment, class_name: 'Course::Assessment', inverse_of: false
  belongs_to :published_by, class_name: 'User', inverse_of: false

  validates :published_at, presence: true, uniqueness: { scope: :listing_id }
  validates :assessment, presence: true
  validates :published_by, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  scope :ordered, -> { order(published_at: :asc) }

  # Version identity for a set of container assessments. Publishing duplicates the title verbatim and
  # every snapshot lands in the same tab of the one container course, so nothing on the assessment row
  # says which listing it belongs to — it can only be read back from here. The listing join supplies
  # provenance that survives origin-course deletion, which snapshot is current, and whether it is listed.
  #
  # Two kinds are labelled: a snapshot has a version row and yields its publication datetime; a
  # restored working copy has none — it is the listing's `authoring_assessment` — and yields
  # `published_at: nil`, which the client renders as an "Authoring" chip. Without that second lookup
  # it would be the one assessment in the container with no chip at all.
  #
  # @param [Array<Integer>] assessment_ids
  # @return [Hash{Integer => Hash}] keyed by assessment id, each holding `:listing_id`,
  #   `:published_at`, `:source`, `:latest` and `:listed`; assessments that are neither a snapshot
  #   nor a working copy are absent from the hash.
  def self.labels_for_assessments(assessment_ids)
    return {} if assessment_ids.empty?

    snapshot_labels(assessment_ids).merge(working_copy_labels(assessment_ids))
  end

  # `:id` must be a symbol: both joined tables have an `id`, and Rails qualifies symbols to this
  # model's own table while passing strings through verbatim — `'id'` would reach Postgres
  # unqualified and be rejected as ambiguous. `listed` reads the listing's `published` column
  # directly rather than `admin_state`, so this query is not coupled to what that method means.
  #
  # @param [Array<Integer>] assessment_ids
  # @return [Hash{Integer => Hash}]
  def self.snapshot_labels(assessment_ids)
    joins(:listing).
      where(assessment_id: assessment_ids).
      pluck(:assessment_id, :listing_id, :id, :published_at,
            'course_assessment_marketplace_listings.source_course_name',
            'course_assessment_marketplace_listings.current_version_id',
            'course_assessment_marketplace_listings.published').
      to_h do |(assessment_id, listing_id, version_id, published_at, source, current_version_id, listed)|
        [assessment_id, listing_id: listing_id, published_at: published_at, source: source,
                        latest: version_id == current_version_id, listed: listed]
      end
  end
  private_class_method :snapshot_labels

  # The working copy is not a version, so `latest` is unconditionally false — the listing's
  # `current_version` always points at a snapshot, never at this. `listed` belongs to the listing,
  # so it is reported here exactly as it is on that listing's snapshots.
  #
  # @param [Array<Integer>] assessment_ids
  # @return [Hash{Integer => Hash}]
  def self.working_copy_labels(assessment_ids)
    Course::Assessment::Marketplace::Listing.
      where(authoring_assessment_id: assessment_ids).
      pluck(:authoring_assessment_id, :id, :source_course_name, :published).
      to_h do |assessment_id, listing_id, source, listed|
        [assessment_id, listing_id: listing_id, published_at: nil, source: source,
                        latest: false, listed: listed]
      end
  end
  private_class_method :working_copy_labels
end
