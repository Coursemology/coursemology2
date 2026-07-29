# frozen_string_literal: true
class Course::Assessment::Marketplace::Listing < ApplicationRecord
  # The mutable authoring copy — the origin-course assessment. Nullable: the listing outlives
  # deletion of its origin. Browse, preview and duplicate all still read this; the snapshots in
  # `versions` are recorded here but not yet served.
  belongs_to :authoring_assessment, class_name: 'Course::Assessment',
                                    inverse_of: :marketplace_listing, optional: true
  belongs_to :publisher, class_name: 'User', inverse_of: false
  belongs_to :current_version, class_name: 'Course::Assessment::Marketplace::ListingVersion',
                               inverse_of: false, optional: true
  belongs_to :source_course, class_name: 'Course', inverse_of: false, optional: true
  belongs_to :source_instance, class_name: 'Instance', inverse_of: false, optional: true
  belongs_to :fallback_maintainer, class_name: 'User', inverse_of: false, optional: true
  has_many :adoptions, class_name: 'Course::Assessment::Marketplace::Adoption',
                       inverse_of: :listing, dependent: :destroy
  has_many :versions, class_name: 'Course::Assessment::Marketplace::ListingVersion',
                      inverse_of: :listing, dependent: :destroy

  # `allow_nil` is load-bearing: an orphaned listing has a null authoring assessment, and without
  # this the second orphan would collide with the first.
  validates :authoring_assessment_id, uniqueness: true, allow_nil: true
  validates :publisher, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  scope :published, -> { where(published: true) }

  def adoption_count
    adoptions.distinct.count(:destination_course_id)
  end

  # Every listing with the associations the system-admin management view reads. Tenant-free because
  # snapshots live in the container course (its own preview instance) while listings span every one.
  # @return [Array<Course::Assessment::Marketplace::Listing>]
  def self.for_admin_index
    ActsAsTenant.without_tenant do
      # The authoring assessment's own course and instance are preloaded because the view links to it
      # by absolute url: a cross-instance assessment path only resolves on its instance's host.
      includes(:source_course, :source_instance,
               { current_version: { assessment: :lesson_plan_item } },
               { authoring_assessment: { lesson_plan_item: { course: :instance } } }).
        order(id: :desc).to_a
    end
  end

  # An orphaned listing lost its authoring copy (the origin assessment was deleted). Its snapshots
  # survive, but every course-facing path reads the authoring copy, so the listing leaves the
  # marketplace until the rebuild lands. Deliberately separate from `admin_state`, a display concern.
  # @return [Boolean]
  def orphaned?
    authoring_assessment_id.nil?
  end

  # Restorable = orphaned AND still holding a snapshot to duplicate a fresh authoring copy from.
  # A listing that is not orphaned already has one; one without a version has nothing to copy.
  # @return [Boolean]
  def restorable?
    orphaned? && current_version_id.present?
  end

  # An unlisted listing kept its authoring copy but was taken off the marketplace. Distinct from
  # orphaned, which is about the authoring copy rather than visibility — and an orphaned listing keeps
  # its snapshots and its `published` flag, so neither state collapses into the other.
  # @return [Boolean]
  def unlisted?
    !orphaned? && !published?
  end

  # Permanent deletion is offered only for a listing already off the marketplace — orphaned or
  # unlisted. Requiring the unlist first keeps the reversible step ahead of the irreversible one,
  # and leaves an unlisted listing's source assessment untouched, so it can be published again.
  # @return [Boolean]
  def purgeable?
    orphaned? || unlisted?
  end

  # Whether the authoring copy lives in the marketplace's container course rather than in a course
  # somebody owns — true for a listing rebuilt after orphaning, and for one authored in the
  # container directly. It is the only thing on the record that says where the copy an admin would
  # edit actually is: `RestoreAuthoringJob` leaves the provenance fields on the origin course.
  #
  # `without_tenant` is load-bearing, not defensive. `Course` is `acts_as_tenant :instance` and the
  # container lives in the dedicated preview instance, so under every real admin request the tenant
  # scope filters it out and `authoring_assessment.course` returns nil rather than raising, making this
  # answer `false` for exactly the listings it identifies. Same reason `.for_admin_index` is tenant-free.
  # @return [Boolean]
  def marketplace_hosted?
    ActsAsTenant.without_tenant { authoring_assessment&.course&.preview? } || false
  end

  # Whether the original source assessment is gone — either there is no authoring copy at all (never
  # rebuilt after orphaning, or the rebuild failed), or there is one but it now lives in the
  # marketplace container while the listing was published elsewhere. `RestoreAuthoringJob` produces
  # the second case: it duplicates into the container but leaves provenance on the origin course.
  #
  # `source_course&.preview?` keeps this false for a listing authored in the container directly,
  # where the container legitimately is the source course and nothing was ever lost.
  # `without_tenant` for the reason `marketplace_hosted?` gives.
  # @return [Boolean]
  def source_assessment_deleted?
    return true if orphaned?

    ActsAsTenant.without_tenant { marketplace_hosted? && !source_course&.preview? }
  end

  # Whether the original source course is gone. `source_course_id`'s FK is `on_delete: :nullify`, so
  # the id disappears when the course is destroyed while the denormalised `source_course_name`
  # survives. Requiring the name too tells a real deletion apart from a legacy row that never
  # recorded provenance at all — both have a nil id, only the deleted one carries a name.
  # @return [Boolean]
  def source_course_deleted?
    source_course_id.nil? && source_course_name.present?
  end

  # Visibility only: whether the listing is on the marketplace. The two deletion facts
  # (`source_assessment_deleted?`, `source_course_deleted?`) are deliberately separate predicates
  # rather than states here — a listing whose authoring copy was rebuilt into the container is
  # visible and has a deleted origin at the same time, which one enum value cannot carry.
  # @return [String] one of 'unlisted', 'published'
  def admin_state
    published? ? 'published' : 'unlisted'
  end
end
