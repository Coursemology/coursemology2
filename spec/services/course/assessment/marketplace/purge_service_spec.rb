# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PurgeService, type: :service do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    # The `:versioned` trait stands the snapshot up in the origin's own course rather than the shared
    # preview container (see the factory) — the rows and the FK graph under test are identical, and
    # unrelated specs then do not pay for container provisioning.
    let(:listing) { create(:course_assessment_marketplace_listing, :versioned) }
    let(:snapshot) { listing.current_version.assessment }

    def orphan!
      listing.authoring_assessment.destroy!
      listing.reload
    end

    describe '.purge!' do
      context 'when the listing is orphaned with no adoptions' do
        before { snapshot && orphan! }

        it 'deletes the listing' do
          expect { described_class.purge!(listing) }.
            to change { Course::Assessment::Marketplace::Listing.where(id: listing.id).count }.by(-1)
        end

        it 'deletes its versions' do
          expect { described_class.purge!(listing) }.
            to change { Course::Assessment::Marketplace::ListingVersion.where(listing_id: listing.id).count }.by(-1)
        end

        # Without this the container course would grow forever: nothing else references a snapshot
        # once its version row is gone, so there would be no reclaim path.
        it 'deletes the container snapshot assessments' do
          expect { described_class.purge!(listing) }.
            to change { Course::Assessment.where(id: snapshot.id).count }.by(-1)
        end

        it 'deletes every snapshot, not only the current one' do
          older = create(:assessment, course: snapshot.course)
          older_published_at = listing.current_version.published_at - 1.day
          create(:course_assessment_marketplace_listing_version,
                 listing: listing, assessment: older, published_at: older_published_at,
                 published_by: listing.publisher)

          expect { described_class.purge!(listing) }.
            to change { Course::Assessment.where(id: [snapshot.id, older.id]).count }.by(-2)
        end

        it 'leaves an unrelated listing and its snapshot alone' do
          other = create(:course_assessment_marketplace_listing, :versioned)
          other_snapshot = other.current_version.assessment

          described_class.purge!(listing)

          expect(other.reload).to be_persisted
          expect(other_snapshot.reload).to be_persisted
        end
      end

      # Unlisted rather than orphaned: the authoring copy is still there, so the source assessment
      # outlives the purge and the listing can simply be published again.
      context 'when the listing is unlisted with no adoptions' do
        before do
          snapshot
          listing.update!(published: false)
        end

        it 'deletes the listing and its snapshots' do
          expect { described_class.purge!(listing) }.
            to change { Course::Assessment::Marketplace::Listing.where(id: listing.id).count }.by(-1).
            and change { Course::Assessment.where(id: snapshot.id).count }.by(-1)
        end

        it 'leaves the authoring assessment alone, so the listing can be published again' do
          authoring = listing.authoring_assessment

          described_class.purge!(listing)

          expect(authoring.reload).to be_persisted
        end
      end

      # Publishing is the state that has to be undone first; unlisting is reversible, purging is not.
      context 'when the listing is still published' do
        it 'raises and deletes nothing' do
          snapshot
          expect { described_class.purge!(listing) }.to raise_error(ArgumentError)
          expect(listing.reload).to be_persisted
          expect(snapshot.reload).to be_persisted
        end
      end

      context 'when the unlisted listing has adoptions' do
        before { listing.update!(published: false) }

        it 'deletes the listing and its adoption rows, but not the adopters own duplicated assessments' do
          adoption = create(:course_assessment_marketplace_adoption, listing: listing)
          duplicated_assessment = adoption.duplicated_assessment

          expect { described_class.purge!(listing) }.
            to change { Course::Assessment::Marketplace::Listing.where(id: listing.id).count }.by(-1).
            and change { Course::Assessment::Marketplace::Adoption.where(id: adoption.id).count }.by(-1)

          # A purge must never reach into another course's content — the adopter's own copy is not the
          # listing's or the container's to delete.
          expect(duplicated_assessment.reload).to be_persisted
        end
      end

      context 'when the orphaned listing has adoptions' do
        before { orphan! }

        it 'deletes the listing and its adoption rows, but not the adopters own duplicated assessments' do
          adoption = create(:course_assessment_marketplace_adoption, listing: listing)
          duplicated_assessment = adoption.duplicated_assessment

          expect { described_class.purge!(listing) }.
            to change { Course::Assessment::Marketplace::Listing.where(id: listing.id).count }.by(-1).
            and change { Course::Assessment::Marketplace::Adoption.where(id: adoption.id).count }.by(-1)

          expect(duplicated_assessment.reload).to be_persisted
        end
      end
    end
  end
end
