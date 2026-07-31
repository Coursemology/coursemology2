# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::Listing, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    it { is_expected.to belong_to(:authoring_assessment).class_name('Course::Assessment').optional }
    it { is_expected.to belong_to(:publisher).class_name('User') }
    it { is_expected.to belong_to(:source_instance).class_name('Instance').optional }
    it do
      is_expected.to have_many(:adoptions).
        class_name('Course::Assessment::Marketplace::Adoption').dependent(:destroy)
    end

    describe 'validations' do
      subject { build(:course_assessment_marketplace_listing) }

      it { is_expected.to validate_presence_of(:publisher) }

      it 'validates uniqueness of authoring_assessment_id' do
        existing = create(:course_assessment_marketplace_listing)
        dup = build(:course_assessment_marketplace_listing,
                    authoring_assessment: existing.authoring_assessment)
        expect(dup).not_to be_valid
      end
    end

    describe '.published' do
      it 'includes published listings and excludes unpublished ones' do
        published = create(:course_assessment_marketplace_listing, published: true)
        unpublished = create(:course_assessment_marketplace_listing, published: false)
        expect(described_class.published).to include(published)
        expect(described_class.published).not_to include(unpublished)
      end
    end

    describe '#adoption_count' do
      subject { create(:course_assessment_marketplace_listing) }

      it 'counts distinct destination courses' do
        course_a = create(:course)
        create(:course_assessment_marketplace_adoption, listing: subject, destination_course: course_a)
        create(:course_assessment_marketplace_adoption, listing: subject, destination_course: course_a)
        create(:course_assessment_marketplace_adoption, listing: subject, destination_course: create(:course))
        expect(subject.adoption_count).to eq(2)
      end
    end

    describe 'versioning associations (additive; all nullable)' do
      let(:listing) { create(:course_assessment_marketplace_listing) }

      it 'is valid without any versioning fields set' do
        expect(listing.current_version).to be_nil
        expect(listing.source_course).to be_nil
        expect(listing.source_instance).to be_nil
        expect(listing.fallback_maintainer).to be_nil
        expect(listing).to be_valid
      end

      # Nullify rather than cascade: losing the instance a listing was published from must not take
      # the listing, its version chain and every adopter's adoption row with it.
      it 'keeps the listing but nullifies the reference when the source instance is deleted' do
        origin_instance = create(:instance)
        listing.update!(source_instance: origin_instance)

        expect { origin_instance.destroy! }.
          not_to(change { described_class.where(id: listing.id).count })
        expect(listing.reload.source_instance_id).to be_nil
      end

      it 'has many ordered versions and can point at a current version' do
        earlier = 2.days.ago.change(usec: 0)
        later = 1.day.ago.change(usec: 0)
        v1 = create(:course_assessment_marketplace_listing_version, listing: listing, published_at: earlier)
        v2 = create(:course_assessment_marketplace_listing_version, listing: listing, published_at: later)
        listing.update!(current_version: v2)
        expect(listing.versions.ordered).to eq([v1, v2])
        expect(listing.current_version).to eq(v2)
      end

      it 'destroys its versions when destroyed' do
        create(:course_assessment_marketplace_listing_version, listing: listing)
        expect { listing.destroy }.
          to change { Course::Assessment::Marketplace::ListingVersion.count }.by(-1)
      end

      it 'does not destroy versions belonging to another listing' do
        other_listing = create(:course_assessment_marketplace_listing)
        other_version = create(:course_assessment_marketplace_listing_version,
                               listing: other_listing)
        create(:course_assessment_marketplace_listing_version, listing: listing)

        expect { listing.destroy }.
          to change { Course::Assessment::Marketplace::ListingVersion.count }.by(-1)
        expect(other_version.reload).to be_persisted
      end

      it 'optionally references a source course, fallback maintainer, and provenance' do
        course = create(:course)
        maintainer = create(:user)
        listing.update!(source_course: course, source_course_name: 'Intro to AI',
                        fallback_maintainer: maintainer)
        expect(listing.source_course).to eq(course)
        expect(listing.fallback_maintainer).to eq(maintainer)
        expect(listing.source_course_name).to eq('Intro to AI')
      end
    end

    describe 'the :versioned factory trait' do
      it 'cuts a v1 whose assessment is distinct from the authoring copy' do
        listing = create(:course_assessment_marketplace_listing, :versioned)

        expect(listing.current_version).to be_present
        expect(listing.current_version.published_at).to be_within(1.second).of(listing.first_published_at)
        expect(listing.current_version.assessment).not_to eq(listing.authoring_assessment)
      end

      it 'leaves the listing unversioned when the trait is not applied' do
        expect(create(:course_assessment_marketplace_listing).current_version).to be_nil
      end
    end

    # The preview sandbox lock's only per-assessment check (see
    # spec/controllers/course/assessment/marketplace/preview_sandbox_lock_spec.rb), so each way of
    # being "in the container but not served" is worth stating outright.
    describe '.serving_assessment?' do
      let(:listing) { create(:course_assessment_marketplace_listing, :versioned) }
      let(:served) { listing.current_version.assessment }

      it 'is true for the assessment the current version points at' do
        expect(described_class).to be_serving_assessment(served.id)
      end

      it 'is false for an assessment no version points at' do
        expect(described_class).not_to be_serving_assessment(listing.authoring_assessment.id)
      end

      it 'is false for a superseded version' do
        superseded = listing.current_version
        newer = create(:course_assessment_marketplace_listing_version,
                       listing: listing,
                       assessment: create(:assessment, course: listing.authoring_assessment.course),
                       published_at: 1.hour.from_now,
                       published_by: listing.publisher)
        listing.update!(current_version: newer)

        expect(described_class).not_to be_serving_assessment(superseded.assessment_id)
        expect(described_class).to be_serving_assessment(newer.assessment_id)
      end

      it 'is false once the listing is unlisted' do
        listing.update!(published: false)
        expect(described_class).not_to be_serving_assessment(served.id)
      end

      it 'is false for a blank id, without querying for one' do
        expect(described_class).not_to be_serving_assessment(nil)
      end
    end

    describe 'maintenance predicates' do
      let(:listing) { create(:course_assessment_marketplace_listing, :versioned) }

      # Orphaning is CONSTRUCTED here rather than derived from a deletion. Deleting the authoring
      # assessment of a versioned listing re-points it at a fresh container copy in the same
      # transaction (Course::Assessment#repoint_marketplace_listing_authoring), so a deletion no longer
      # produces this state: the orphans left are rows orphaned before that shipped, and listings with
      # no version to rebuild from.
      def orphan!(target = listing)
        target.update!(authoring_assessment: nil)
        target.reload
      end

      describe '#orphaned?' do
        it 'is false while the authoring assessment exists' do
          expect(listing).not_to be_orphaned
        end

        it 'is true once the listing loses its authoring copy' do
          expect(orphan!).to be_orphaned
        end
      end

      describe '#unlisted?' do
        it 'is true once a listing with an authoring copy is taken off the marketplace' do
          listing.update!(published: false)
          expect(listing).to be_unlisted
        end

        it 'is false while the listing is published' do
          expect(listing).not_to be_unlisted
        end

        # Orphaning is about the authoring copy, unlisting about marketplace visibility, and an
        # orphaned listing keeps serving its snapshot — so the two states are reported separately
        # rather than one collapsing into the other.
        it 'is false for an orphaned listing even though it has no authoring copy' do
          expect(orphan!).not_to be_unlisted
        end
      end

      # Purge is offered for a listing that is NOT on the marketplace — orphaned or unlisted —
      # regardless of adoption history: a deliberate admin deletion of an adopted listing must be
      # allowed to proceed.
      describe '#purgeable?' do
        it 'is true for an orphaned listing with no adoptions' do
          expect(orphan!).to be_purgeable
        end

        it 'is true for an unlisted listing with no adoptions' do
          listing.update!(published: false)
          expect(listing).to be_purgeable
        end

        # Unlisting is the reversible step and has to be taken first; it is also what makes the
        # deletion recoverable, since the source assessment survives and can be published again.
        it 'is false for a published listing' do
          expect(listing).not_to be_purgeable
        end

        it 'is true for an orphaned listing that has been adopted' do
          create(:course_assessment_marketplace_adoption, listing: listing)
          expect(orphan!).to be_purgeable
        end

        it 'is true for an unlisted listing that has been adopted' do
          create(:course_assessment_marketplace_adoption, listing: listing)
          listing.update!(published: false)

          expect(listing).to be_purgeable
        end
      end
    end

    describe '#admin_state' do
      let(:origin_course) { create(:course) }
      # Eager: the deleted-course example destroys `origin_course`, and a lazily built listing would
      # then try to create its authoring assessment inside a course that no longer exists.
      let!(:listing) do
        create(:course_assessment_marketplace_listing, course: origin_course, source_course: origin_course)
      end

      it 'is published while the listing is listed and still has its authoring copy' do
        expect(listing.admin_state).to eq('published')
      end

      it 'is unlisted once the listing is unpublished' do
        listing.update!(published: false)
        expect(listing.admin_state).to eq('unlisted')
      end

      # Visibility did not change: `admin_state` no longer tracks the authoring copy at all, so a
      # deleted origin assessment leaves a published listing published. The deletion fact now lives
      # on `#source_assessment_deleted?` instead (see below).
      it 'stays published when the authoring assessment is deleted' do
        listing.authoring_assessment.destroy!
        expect(listing.reload.admin_state).to eq('published')
      end

      # Same reasoning for a deleted origin course: visibility is untouched.
      it 'stays published when the origin course is deleted' do
        origin_course.destroy!
        expect(listing.reload.admin_state).to eq('published')
      end

      it 'reports unlisted, not a deletion fact, when an unpublished listing loses its copy' do
        listing.update!(published: false)
        listing.authoring_assessment.destroy!
        expect(listing.reload.admin_state).to eq('unlisted')
      end
    end

    # These two predicates carry the deletion facts that used to live inside `admin_state` as
    # 'orphaned_assessment_deleted' / 'orphaned_course_deleted'. Split out because a listing whose
    # authoring copy was rebuilt into the marketplace container is visible (published) AND has a
    # deleted origin at the same time — one enum value cannot report both.
    describe '#source_assessment_deleted?' do
      let(:origin_course) { create(:course) }
      let!(:listing) do
        create(:course_assessment_marketplace_listing, :versioned, course: origin_course,
                                                                   source_course: origin_course)
      end

      it 'is false for a normal published listing with an intact authoring copy' do
        expect(listing).not_to be_source_assessment_deleted
      end

      it 'is false for an unlisted listing with an intact authoring copy' do
        listing.update!(published: false)
        expect(listing).not_to be_source_assessment_deleted
      end

      it 'is true once the authoring assessment is destroyed' do
        listing.authoring_assessment.destroy!
        expect(listing.reload).to be_source_assessment_deleted
      end

      # The re-point clones into the container and leaves `source_course` pointing at the ORIGIN, so
      # this is that case: published and marketplace-hosted, but the original is still gone.
      it 'is true once the authoring copy is rebuilt into the marketplace container' do
        container = Course::Assessment::Marketplace::PreviewContainerService.container_course
        rebuilt = ActsAsTenant.with_tenant(container.instance) { create(:assessment, course: container) }
        listing.update!(authoring_assessment: rebuilt)

        expect(listing).to be_source_assessment_deleted
        expect(listing).to be_marketplace_hosted
      end

      # The case the predicate exists to get right: authored in the container DIRECTLY, so the
      # container legitimately IS the source course and nothing was ever lost.
      it 'is false for a listing authored in the container directly' do
        container = Course::Assessment::Marketplace::PreviewContainerService.container_course
        container_assessment = ActsAsTenant.with_tenant(container.instance) do
          create(:assessment, course: container)
        end
        direct = create(:course_assessment_marketplace_listing, authoring_assessment: container_assessment,
                                                                source_course: container,
                                                                publisher: create(:user))

        expect(direct).not_to be_source_assessment_deleted
        expect(direct).to be_marketplace_hosted
      end
    end

    describe '#source_course_deleted?' do
      let(:origin_course) { create(:course) }
      let!(:listing) do
        create(:course_assessment_marketplace_listing, course: origin_course, source_course: origin_course,
                                                       source_course_name: origin_course.title)
      end

      it 'is false while the origin course exists' do
        expect(listing).not_to be_source_course_deleted
      end

      it 'is false when only the authoring assessment is deleted, since the origin course survives' do
        listing.authoring_assessment.destroy!
        expect(listing.reload).not_to be_source_course_deleted
      end

      # The FK nullifies `source_course_id` on course deletion; `source_course_name` is denormalised
      # and survives, which is what tells a real deletion apart from a legacy row lacking provenance.
      it 'is true once the origin course itself is destroyed' do
        origin_course.destroy!
        listing.reload

        expect(listing.source_course_id).to be_nil
        expect(listing).to be_source_course_deleted
        expect(listing).to be_source_assessment_deleted
      end

      it 'is false for a legacy listing that never recorded a source course at all' do
        legacy = create(:course_assessment_marketplace_listing)
        expect(legacy).not_to be_source_course_deleted
      end
    end

    # Orthogonal to `admin_state`: this reports WHERE the authoring copy lives, while `admin_state`
    # reports marketplace visibility. A rebuilt listing can go on to be unlisted, so neither answer
    # can be read off the other.
    describe '#marketplace_hosted?' do
      # `index_courses_on_instance_id_one_preview` allows one preview course per instance, so each
      # example brings its own — built inside it, since the factory reads through the tenant scope.
      def hosted_listing
        ActsAsTenant.with_tenant(create(:instance)) do
          create(:course_assessment_marketplace_listing, course: create(:course, preview: true))
        end
      end

      it 'is false while the authoring copy lives in an ordinary course' do
        listing = create(:course_assessment_marketplace_listing)
        expect(listing).not_to be_marketplace_hosted
      end

      # Keyed off `Course#preview`, never off a specific instance id — the same rule
      # PreviewContainerService documents, so a container in any instance reports correctly.
      it 'is true once the authoring copy lives in a preview container course' do
        expect(hosted_listing).to be_marketplace_hosted
      end

      it 'stays true for a marketplace-hosted listing that is later unlisted' do
        listing = hosted_listing
        listing.update!(published: false)

        expect(listing.admin_state).to eq('unlisted')
        expect(listing).to be_marketplace_hosted
      end

      # The regression this method's `without_tenant` exists for. The real container lives in the
      # dedicated preview instance, so every admin request asks from a different tenant — and a
      # tenant-scoped `Course` lookup returns nil rather than raising, which would answer `false` for
      # precisely the listings it identifies. The examples above use a same-instance container.
      it 'sees the container even when the caller is tenanted to another instance' do
        preview_instance = create(:instance)
        container = ActsAsTenant.with_tenant(preview_instance) { create(:course, preview: true) }
        copy = ActsAsTenant.with_tenant(preview_instance) { create(:assessment, course: container) }
        # `publisher` passed explicitly: the factory default reads `authoring_assessment.course.creator`,
        # which is itself tenant-scoped and would blow up here for the very reason under test.
        listing = create(:course_assessment_marketplace_listing, authoring_assessment: copy,
                                                                 publisher: create(:user))

        expect(listing).to be_marketplace_hosted
      end

      it 'is false for an orphaned listing, which has no authoring copy at all' do
        listing = hosted_listing
        listing.authoring_assessment.destroy!

        expect(listing.reload).not_to be_marketplace_hosted
      end
    end

    describe 'when the authoring assessment is deleted' do
      # The deletion path enqueues nothing, but the env default is `:background_thread` — a real thread
      # sharing this example's connection — and these assertions must answer for the callback alone.
      with_active_job_queue_adapter(:test) do
        let!(:listing) { create(:course_assessment_marketplace_listing, :versioned, published: true) }
        let!(:adoption) { create(:course_assessment_marketplace_adoption, listing: listing) }

        # The listing NEVER loses its authoring copy while it has a version to rebuild one from: the
        # copy is replaced, in the same transaction, by one the marketplace owns. Its version chain and
        # its adopters' records are untouched either way — a deleted source assessment must never take
        # them with it.
        it 'is re-pointed at a marketplace-owned copy, keeping its versions and adoptions' do
          expect { listing.authoring_assessment.destroy! }.
            not_to(change { described_class.where(id: listing.id).count })

          expect(listing.reload.authoring_assessment_id).not_to be_nil
          expect(listing).to be_marketplace_hosted
          expect(listing.versions.count).to eq(1)
          expect(listing.adoptions).to include(adoption)
        end

        # No version, nothing to rebuild from — and no Ruby `dependent:` option on the association
        # either, so this is `fk_caml_authoring_assessment_id`'s `on_delete: :nullify` doing the work.
        it 'survives with a null authoring assessment when it has no version, keeping its adoptions' do
          versionless = create(:course_assessment_marketplace_listing, published: true)
          versionless_adoption = create(:course_assessment_marketplace_adoption, listing: versionless)

          expect { versionless.authoring_assessment.destroy! }.
            not_to(change { described_class.where(id: versionless.id).count })

          expect(versionless.reload.authoring_assessment_id).to be_nil
          expect(versionless.adoptions).to include(versionless_adoption)
        end

        it 'permits a second orphaned listing to coexist' do
          first = create(:course_assessment_marketplace_listing)
          second = create(:course_assessment_marketplace_listing)
          first.authoring_assessment.destroy!

          expect { second.authoring_assessment.destroy! }.
            not_to(change { described_class.where(id: [first.id, second.id]).count })

          expect(first.reload.authoring_assessment_id).to be_nil
          expect(second.reload.authoring_assessment_id).to be_nil
        end
      end
    end
  end
end
