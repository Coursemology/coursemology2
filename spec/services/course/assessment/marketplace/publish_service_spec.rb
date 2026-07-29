# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PublishService, type: :service do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:publisher) { create(:user) }

    def container
      ActsAsTenant.without_tenant do
        Course::Assessment::Marketplace::PreviewContainerService.container_course
      end
    end

    describe '.publish' do
      it 'activates the listing and cuts version 1 published by the publisher' do
        listing = described_class.publish(assessment, publisher)
        expect(listing.published).to be(true)
        expect(listing.current_version).to be_present
        expect(listing.current_version.published_at).to eq(listing.first_published_at)
        expect(listing.current_version.published_by).to eq(publisher)
      end

      it 'snapshots a distinct copy of the assessment into the container course' do
        listing = described_class.publish(assessment, publisher)
        snapshot = listing.current_version.assessment
        ActsAsTenant.without_tenant do
          expect(snapshot).not_to eq(assessment)
          expect(snapshot.course).to eq(container)
        end
      end

      it 'creates exactly one version row' do
        expect { described_class.publish(assessment, publisher) }.
          to change { Course::Assessment::Marketplace::ListingVersion.count }.by(1)
      end

      it 'captures denormalized provenance from the source course' do
        listing = described_class.publish(assessment, publisher)
        expect(listing.source_course).to eq(course)
        expect(listing.source_course_name).to eq(course.title)
        expect(listing.fallback_maintainer).to eq(course.course_users.find_by(role: :owner).user)
      end

      # `source_course_code` stays permanently nil — Coursemology's Course has no code concept, so
      # the column is reserved for a future field (design V17). The source DATES are filled, from
      # start_at/end_at, because they are the only "when was this taught" signal that survives
      # deletion of the origin course.
      it 'leaves source_course_code nil but records the source dates' do
        listing = described_class.publish(assessment, publisher)
        expect(listing.source_course_code).to be_nil
        expect(listing.source_started_at).to be_present
        expect(listing.source_ended_at).to be_present
      end

      it 'does not cut a second version when re-published (first-publish only this slice)' do
        described_class.publish(assessment, publisher)
        expect { described_class.publish(assessment, publisher) }.
          not_to(change { Course::Assessment::Marketplace::ListingVersion.count })
      end

      it 'preserves first_published_at and bumps last_published_at on re-publish' do
        old = 3.days.ago
        listing = create(:course_assessment_marketplace_listing, authoring_assessment: assessment,
                                                                 published: false,
                                                                 first_published_at: old,
                                                                 last_published_at: old)
        result = described_class.publish(assessment, publisher)
        expect(result.id).to eq(listing.id)
        expect(result.first_published_at).to be_within(1.second).of(old)
        expect(result.last_published_at).to be > old
      end
    end

    describe '.ensure_first_version!' do
      let(:listing) do
        create(:course_assessment_marketplace_listing, authoring_assessment: assessment, published: true)
      end

      it 'cuts version 1 for a published listing that has none' do
        expect(listing.current_version).to be_nil
        version = described_class.ensure_first_version!(listing, publisher)
        expect(version.published_at).to eq(listing.first_published_at)
        expect(listing.reload.current_version).to eq(version)
      end

      it 'is idempotent: a second call cuts no new version' do
        described_class.ensure_first_version!(listing, publisher)
        expect { described_class.ensure_first_version!(listing, publisher) }.
          not_to(change { Course::Assessment::Marketplace::ListingVersion.count })
      end

      it 'captures provenance during the version cut' do
        described_class.ensure_first_version!(listing, publisher)
        expect(listing.reload.source_course).to eq(course)
        expect(listing.source_course_name).to eq(course.title)
      end
    end

    describe '.publish_new_version' do
      let!(:listing) { described_class.publish(assessment, publisher) }
      let(:cutter) { create(:user) }

      it 'cuts the next version from the authoring copy and advances current_version' do
        version = described_class.publish_new_version(listing.reload, cutter)

        expect(version.published_at).to eq(listing.reload.last_published_at)
        expect(version.published_by).to eq(cutter)
        expect(listing.reload.current_version).to eq(version)
      end

      it 'snapshots into the container as a copy distinct from the authoring assessment' do
        version = described_class.publish_new_version(listing.reload, cutter)

        ActsAsTenant.without_tenant do
          expect(version.assessment).not_to eq(listing.authoring_assessment)
          expect(version.assessment.course).to eq(container)
        end
      end

      it 'retains the previous snapshot' do
        v1 = listing.current_version

        expect { described_class.publish_new_version(listing.reload, cutter) }.
          to change { listing.reload.versions.count }.by(1)
        expect(v1.reload).to be_persisted
      end

      it 'adds exactly one assessment to the container per cut' do
        expect { described_class.publish_new_version(listing.reload, cutter) }.
          to change { ActsAsTenant.without_tenant { container.assessments.count } }.by(1)
      end

      it 'keeps advancing past the second cut' do
        described_class.publish_new_version(listing.reload, cutter)
        third = described_class.publish_new_version(listing.reload, cutter)

        expect(third.published_at).to eq(listing.reload.last_published_at)
      end

      it 'bumps last_published_at' do
        listing.update!(last_published_at: 3.days.ago)

        expect { described_class.publish_new_version(listing.reload, cutter) }.
          to(change { listing.reload.last_published_at })
      end

      it 'raises when the listing is orphaned' do
        listing.update!(authoring_assessment: nil)

        expect { described_class.publish_new_version(listing.reload, cutter) }.
          to raise_error(ArgumentError, /orphaned/)
      end
    end

    describe 'provenance capture' do
      it 'records the source course name and teaching dates at publish' do
        started_at = Time.zone.local(2026, 1, 12)
        ended_at = Time.zone.local(2026, 5, 30)
        course.update!(start_at: started_at, end_at: ended_at)

        listing = described_class.publish(assessment, publisher)

        expect(listing.source_course).to eq(course)
        expect(listing.source_course_name).to eq(course.title)
        # Copied verbatim, NOT formatted: the client renders the range, so a lossy month-year string
        # here would be the wrong storage shape.
        expect(listing.source_started_at).to eq(started_at)
        expect(listing.source_ended_at).to eq(ended_at)
      end

      # `Course` is tenanted by instance, so the origin instance is what makes the recorded course id
      # resolvable at all — and what tells two courses of the same name in different instances apart.
      it 'records the source instance at publish' do
        listing = described_class.publish(assessment, publisher)

        expect(listing.source_instance).to eq(instance)
      end

      it 'records the source instance during a version cut that repairs provenance' do
        listing = create(:course_assessment_marketplace_listing, authoring_assessment: assessment,
                                                                 published: true)
        listing.update_columns(source_instance_id: nil)

        described_class.ensure_first_version!(listing, publisher)

        expect(listing.reload.source_instance).to eq(instance)
      end

      # `||=`, like every sibling provenance field: provenance is what was true at first publish, and
      # a later re-publish (possibly from a course moved between instances) must not rewrite history.
      it 'does not overwrite a source instance already captured when re-published' do
        origin_instance = create(:instance)
        listing = create(:course_assessment_marketplace_listing, authoring_assessment: assessment,
                                                                 published: false,
                                                                 source_instance: origin_instance)

        described_class.publish(assessment, publisher)

        expect(listing.reload.source_instance).to eq(origin_instance)
      end
    end

    describe '.backfill_source_instances!' do
      it 'fills the instance from a surviving source course' do
        listing = create(:course_assessment_marketplace_listing, authoring_assessment: assessment,
                                                                 source_course: course)
        listing.update_columns(source_instance_id: nil)

        expect { described_class.backfill_source_instances! }.
          to change { listing.reload.source_instance }.from(nil).to(instance)
      end

      # Documented limitation: an already-orphaned listing has no source course for the backfill to
      # read, and nothing else on the row identifies its origin. It stays NULL forever, by design.
      it 'leaves an already-orphaned listing with no source course NULL' do
        orphan = create(:course_assessment_marketplace_listing)
        orphan.update_columns(source_course_id: nil, source_instance_id: nil)

        described_class.backfill_source_instances!

        expect(orphan.reload.source_instance).to be_nil
      end

      it 'is idempotent: an instance already recorded is not overwritten' do
        origin_instance = create(:instance)
        listing = create(:course_assessment_marketplace_listing, authoring_assessment: assessment,
                                                                 source_course: course,
                                                                 source_instance: origin_instance)

        described_class.backfill_source_instances!

        expect(listing.reload.source_instance).to eq(origin_instance)
      end
    end

    describe '.backfill_all!' do
      it 'snapshots each published, version-less listing as v1 and sets adopted_version_at' do
        listing = create(:course_assessment_marketplace_listing, authoring_assessment: assessment, published: true)
        adoption = create(:course_assessment_marketplace_adoption, listing: listing)

        described_class.backfill_all!

        expect(listing.reload.current_version.published_at).to eq(listing.first_published_at)
        expect(adoption.reload.adopted_version_at).to eq(listing.current_version.published_at)
      end

      it 'leaves an already-versioned listing untouched' do
        listing = create(:course_assessment_marketplace_listing, authoring_assessment: assessment, published: true)
        described_class.ensure_first_version!(listing, publisher)
        original_version_id = listing.reload.current_version_id

        described_class.backfill_all!

        expect(listing.reload.current_version_id).to eq(original_version_id)
      end

      it 'ignores unpublished listings' do
        unpublished = create(:course_assessment_marketplace_listing, authoring_assessment: assessment, published: false)
        described_class.backfill_all!
        expect(unpublished.reload.current_version).to be_nil
      end

      # An orphan has no authoring copy to snapshot. Before this guard the backfill raised partway
      # through and left every listing after the orphan unversioned.
      it 'skips orphaned listings and still versions the rest' do
        orphan = create(:course_assessment_marketplace_listing, published: true)
        orphan.authoring_assessment.destroy!
        healthy = create(:course_assessment_marketplace_listing, authoring_assessment: assessment, published: true)

        expect { described_class.backfill_all! }.not_to raise_error

        expect(orphan.reload.current_version).to be_nil
        expect(healthy.reload.current_version.published_at).to eq(healthy.first_published_at)
      end
    end

    describe 'version publication dates' do
      let(:publisher) { create(:user) }

      it 'dates v1 from the listing first-publication date, not the moment of the cut' do
        assessment = create(:assessment)
        listing = described_class.publish(assessment, publisher)

        expect(listing.current_version.published_at).
          to be_within(1.second).of(listing.first_published_at)
      end

      # A listing that somehow reaches the cut with no first-publication date must still produce a
      # NOT NULL column rather than blowing up mid-publish.
      it 'falls back to now when the listing has no first-publication date' do
        assessment = create(:assessment)
        listing = described_class.publish(assessment, publisher)
        listing.update_columns(first_published_at: nil, current_version_id: nil)
        listing.versions.destroy_all

        version = described_class.ensure_first_version!(listing.reload, publisher)

        expect(version.published_at).to be_within(5.seconds).of(Time.zone.now)
      end

      it 'dates a later cut from the moment of the cut' do
        assessment = create(:assessment)
        listing = described_class.publish(assessment, publisher)
        listing.update!(first_published_at: 30.days.ago)

        version = described_class.publish_new_version(listing, publisher)

        expect(version.published_at).to be_within(5.seconds).of(Time.zone.now)
      end

      # One `Time.zone.now`, written twice. Two separate calls would leave the version row and the
      # listing disagreeing by milliseconds, and the admin table reads one while the history reads
      # the other.
      it 'writes the identical instant to the version row and the listing' do
        assessment = create(:assessment)
        listing = described_class.publish(assessment, publisher)

        version = described_class.publish_new_version(listing, publisher)

        expect(version.published_at).to eq(listing.reload.last_published_at)
      end

      it 'orders successive cuts by ascending published_at' do
        assessment = create(:assessment)
        listing = described_class.publish(assessment, publisher)
        second = described_class.publish_new_version(listing, publisher)

        expect(listing.versions.ordered.last).to eq(second)
        expect(listing.reload.current_version).to eq(second)
      end
    end
  end
end
