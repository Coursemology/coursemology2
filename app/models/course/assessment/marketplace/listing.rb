# frozen_string_literal: true
class Course::Assessment::Marketplace::Listing < ApplicationRecord
  # The mutable AUTHORING copy — the origin-course assessment. Nullable: the listing outlives
  # deletion of its origin (design §4.3). What the marketplace SERVES is `current_version.assessment`.
  belongs_to :authoring_assessment, class_name: 'Course::Assessment',
                                    inverse_of: :marketplace_listing, optional: true
  belongs_to :publisher, class_name: 'User', inverse_of: false
  belongs_to :current_version, class_name: 'Course::Assessment::Marketplace::ListingVersion',
                               inverse_of: false, optional: true
  belongs_to :source_course, class_name: 'Course', inverse_of: false, optional: true
  # The instance the source course belonged to. Recorded as an id rather than a denormalised name
  # because instances outlive courses: it survives the deletion this provenance exists for, and it
  # yields the origin's HOST as well as its name — a course id only resolves on its own host.
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
  # snapshots live in the container course (instance 0) while listings span every instance.
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

  # An orphaned listing lost its authoring copy (the origin assessment was deleted) but still
  # serves its last snapshot. Deliberately separate from `admin_state`, which is a display concern.
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
  # orphaned, which is about the authoring copy rather than visibility — and an orphaned listing goes
  # on serving its snapshot, so neither state collapses into the other.
  # @return [Boolean]
  def unlisted?
    !orphaned? && !published?
  end

  # Permanent deletion is offered for a listing that is off the marketplace — orphaned or unlisted.
  #
  # A published listing must be unlisted first. That keeps the reversible step ahead of the
  # irreversible one, and it is also what makes purging an unlisted listing the milder operation:
  # its source assessment is untouched, so the listing can simply be published again.
  # @return [Boolean]
  def purgeable?
    orphaned? || unlisted?
  end

  # Whether the authoring copy lives in the marketplace's own container course rather than in a course
  # somebody owns — true for a listing whose source was rebuilt after orphaning, and for any listing
  # authored in the container directly.
  #
  # Deliberately NOT folded into `admin_state`. Visibility (published/unlisted) and authoring location
  # are independent axes: a rebuilt listing can go on to be unlisted, and a single state value could
  # then report only one of the two facts. `RestoreAuthoringJob` additionally leaves the provenance
  # fields pointing at the ORIGIN course, so this is the only thing on the record that says where the
  # copy an admin would edit actually is.
  #
  # Keys off `Course#preview`, never off a specific instance id — the same rule
  # Course::Assessment::Marketplace::PreviewContainerService documents.
  #
  # `without_tenant` is LOAD-BEARING, not defensive. `Course` is `acts_as_tenant :instance` and the
  # container lives in the dedicated preview instance, so under any other tenant — i.e. every real
  # admin request — the tenant scope filters the container out and `authoring_assessment.course`
  # returns **nil rather than raising**. `&.preview?` then short-circuits and this quietly answers
  # `false` for exactly the listings it exists to identify. Same reason
  # `.for_admin_index` and the controller's `authoring_urls` are tenant-free.
  # @return [Boolean]
  def marketplace_hosted?
    ActsAsTenant.without_tenant { authoring_assessment&.course&.preview? } || false
  end

  # Whether the ORIGINAL source assessment is gone — either there is no authoring copy at all (never
  # rebuilt after orphaning, or the rebuild failed), or there is one but it now lives in the
  # marketplace container while the listing was published from somewhere else. The second case is
  # `RestoreAuthoringJob`'s doing: it always duplicates into the container and leaves the provenance
  # fields pointing at the ORIGIN course, so a rebuilt listing is simultaneously published (healthy)
  # and missing its origin (deleted) — two independent facts `admin_state` cannot hold at once.
  #
  # `source_course&.preview?` is what keeps this false for a listing authored in the container
  # DIRECTLY (never orphaned, never rebuilt): there the container legitimately IS the source course,
  # so nothing was ever lost, and `marketplace_hosted?` alone would wrongly call it deleted too.
  # `without_tenant` for the same reason `marketplace_hosted?` needs it — `source_course` is a
  # tenant-scoped lookup and the container lives in a different instance from every real admin
  # request.
  # @return [Boolean]
  def source_assessment_deleted?
    return true if orphaned?

    ActsAsTenant.without_tenant { marketplace_hosted? && !source_course&.preview? }
  end

  # Whether the ORIGINAL source course is gone. `source_course_id`'s FK is `on_delete: :nullify`, so
  # the id disappears when the course is destroyed, while the denormalised `source_course_name`
  # survives it. Requiring the name too is what tells a real deletion apart from a legacy row that
  # never recorded provenance in the first place (both have a nil `source_course_id`, but only the
  # deleted one also carries a name).
  # @return [Boolean]
  def source_course_deleted?
    source_course_id.nil? && source_course_name.present?
  end

  # Visibility only — the ONLY question this answers is whether the listing is on the marketplace.
  # The two deletion facts (`source_assessment_deleted?`, `source_course_deleted?`) used to be folded
  # in here as 'orphaned_assessment_deleted' / 'orphaned_course_deleted', but a listing whose authoring
  # copy was rebuilt into the container is visible AND has a deleted origin at the same time — one
  # enum value cannot carry both, so the deletion facts moved out to their own predicates above.
  # @return [String] one of 'unlisted', 'published'
  def admin_state
    published? ? 'published' : 'unlisted'
  end
end
