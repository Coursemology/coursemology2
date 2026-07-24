# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PublishService, type: :service do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:publisher) { create(:user) }

    def container
      ActsAsTenant.without_tenant { Course::Assessment::Marketplace.container }
    end

    describe '.publish' do
      it 'activates the listing and cuts version 1 published by the publisher' do
        listing = described_class.publish(assessment, publisher)
        expect(listing.published).to be(true)
        expect(listing.current_version).to be_present
        expect(listing.current_version.version).to eq(1)
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

      it 'leaves source_course_code and source_academic_period nil (no source data in Coursemology)' do
        listing = described_class.publish(assessment, publisher)
        expect(listing.source_course_code).to be_nil
        expect(listing.source_academic_period).to be_nil
      end

      it 'does not cut a second version when re-published (first-publish only this slice)' do
        described_class.publish(assessment, publisher)
        expect { described_class.publish(assessment, publisher) }.
          not_to(change { Course::Assessment::Marketplace::ListingVersion.count })
      end

      it 'preserves first_published_at and bumps last_published_at on re-publish' do
        old = 3.days.ago
        listing = create(:course_assessment_marketplace_listing, assessment: assessment,
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
        create(:course_assessment_marketplace_listing, assessment: assessment, published: true)
      end

      it 'cuts version 1 for a published listing that has none' do
        expect(listing.current_version).to be_nil
        version = described_class.ensure_first_version!(listing, publisher)
        expect(version.version).to eq(1)
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

    describe '.backfill_all!' do
      it 'snapshots each published, version-less listing as v1 and sets adopted_version' do
        listing = create(:course_assessment_marketplace_listing, assessment: assessment, published: true)
        adoption = create(:course_assessment_marketplace_adoption, listing: listing)

        described_class.backfill_all!

        expect(listing.reload.current_version&.version).to eq(1)
        expect(adoption.reload.adopted_version).to eq(1)
      end

      it 'leaves an already-versioned listing untouched' do
        listing = create(:course_assessment_marketplace_listing, assessment: assessment, published: true)
        described_class.ensure_first_version!(listing, publisher)
        original_version_id = listing.reload.current_version_id

        described_class.backfill_all!

        expect(listing.reload.current_version_id).to eq(original_version_id)
      end

      it 'ignores unpublished listings' do
        unpublished = create(:course_assessment_marketplace_listing, assessment: assessment, published: false)
        described_class.backfill_all!
        expect(unpublished.reload.current_version).to be_nil
      end
    end
  end
end
