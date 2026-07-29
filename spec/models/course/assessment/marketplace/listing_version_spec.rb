# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::ListingVersion, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:listing) { create(:course_assessment_marketplace_listing) }

    describe 'validations' do
      it 'is valid with the factory' do
        expect(build(:course_assessment_marketplace_listing_version, listing: listing)).to be_valid
      end

      it 'requires a published_at' do
        version = build(:course_assessment_marketplace_listing_version, listing: listing, published_at: nil)
        expect(version).not_to be_valid
        expect(version.errors[:published_at]).to be_present
      end

      it 'requires an assessment' do
        version = build(:course_assessment_marketplace_listing_version, listing: listing, assessment: nil)
        expect(version).not_to be_valid
        expect(version.errors[:assessment]).to be_present
      end

      it 'requires a publisher' do
        version = build(:course_assessment_marketplace_listing_version, listing: listing, published_by: nil)
        expect(version).not_to be_valid
        expect(version.errors[:published_by]).to be_present
      end

      it 'enforces published_at uniqueness scoped to the listing' do
        published = 3.days.ago.change(usec: 0)
        create(:course_assessment_marketplace_listing_version, listing: listing, published_at: published)
        duplicate = build(:course_assessment_marketplace_listing_version, listing: listing,
                                                                         published_at: published)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:published_at]).to be_present
      end

      it 'allows the same published_at on a different listing' do
        published = 3.days.ago.change(usec: 0)
        create(:course_assessment_marketplace_listing_version, listing: listing, published_at: published)
        other = build(:course_assessment_marketplace_listing_version,
                      listing: create(:course_assessment_marketplace_listing), published_at: published)
        expect(other).to be_valid
      end
    end

    describe 'associations' do
      it 'belongs to a listing, snapshot assessment, and publisher' do
        version = create(:course_assessment_marketplace_listing_version, listing: listing)
        expect(version.listing).to eq(listing)
        expect(version.assessment).to be_a(Course::Assessment)
        expect(version.published_by).to be_a(User)
      end
    end

    describe '.ordered' do
      it 'orders by ascending published_at' do
        later = create(:course_assessment_marketplace_listing_version, listing: listing,
                                                                       published_at: 1.day.ago)
        earlier = create(:course_assessment_marketplace_listing_version, listing: listing,
                                                                        published_at: 5.days.ago)
        expect(listing.versions.ordered).to eq([earlier, later])
      end
    end

    describe '.labels_for_assessments' do
      let(:listing) do
        create(:course_assessment_marketplace_listing, source_course_name: 'MP Allowlist Source Course')
      end
      let(:published) { 4.days.ago.change(usec: 0) }
      let!(:version) do
        create(:course_assessment_marketplace_listing_version, listing: listing, published_at: published)
      end

      it 'maps a snapshot to its listing, vintage and denormalised provenance' do
        labels = described_class.labels_for_assessments([version.assessment_id])

        expect(labels[version.assessment_id][:listing_id]).to eq(listing.id)
        expect(labels[version.assessment_id][:published_at]).to be_within(1.second).of(published)
        expect(labels[version.assessment_id][:source]).to eq('MP Allowlist Source Course')
      end

      it 'omits assessments that are not snapshots' do
        plain = create(:assessment)

        labels = described_class.labels_for_assessments([version.assessment_id, plain.id])

        expect(labels.keys).to eq([version.assessment_id])
      end

      it 'issues no query for an empty id list' do
        expect(described_class).not_to receive(:joins)
        expect(described_class.labels_for_assessments([])).to eq({})
      end

      # The restored working copy lives in the container beside the snapshots and is NOT a version,
      # so it has no row here — it is found through the listing's authoring_assessment_id instead.
      # Without this it is the one assessment in the container with no chip at all.
      it 'labels the listing authoring copy with a null vintage' do
        working_copy = create(:assessment)
        listing.update!(authoring_assessment: working_copy)

        labels = described_class.labels_for_assessments([working_copy.id])

        expect(labels[working_copy.id][:published_at]).to be_nil
        expect(labels[working_copy.id][:listing_id]).to eq(listing.id)
      end

      it 'labels a snapshot and a working copy in one call' do
        working_copy = create(:assessment)
        listing.update!(authoring_assessment: working_copy)

        labels = described_class.labels_for_assessments([version.assessment_id, working_copy.id])

        expect(labels.keys).to contain_exactly(version.assessment_id, working_copy.id)
      end

      it 'omits an assessment that is neither a snapshot nor a working copy' do
        plain = create(:assessment)

        expect(described_class.labels_for_assessments([plain.id])).to eq({})
      end

      # `current_version_id` is the pointer the marketplace actually serves from, so the flag reads it
      # rather than recomputing MAX(published_at). The two can disagree: an unlisted listing still has
      # a newest snapshot, and a listing can be pointed back at an older cut deliberately.
      it 'marks the current version as the latest' do
        listing.update!(current_version: version)

        labels = described_class.labels_for_assessments([version.assessment_id])

        expect(labels[version.assessment_id][:latest]).to be(true)
      end

      it 'does not mark a superseded snapshot as the latest' do
        pointed_at = create(:course_assessment_marketplace_listing_version, listing: listing,
                                                                            published_at: 1.day.ago)
        listing.update!(current_version: pointed_at)

        labels = described_class.labels_for_assessments([version.assessment_id, pointed_at.assessment_id])

        expect(labels[version.assessment_id][:latest]).to be(false)
        expect(labels[pointed_at.assessment_id][:latest]).to be(true)
      end

      it 'marks nothing as the latest when the listing has no current version' do
        listing.update!(current_version: nil)

        labels = described_class.labels_for_assessments([version.assessment_id])

        expect(labels[version.assessment_id][:latest]).to be(false)
      end

      # The working copy is not a version at all — it has no row in this table — so it can never be
      # the latest one, even while the listing points at a perfectly good current version.
      it 'never marks the authoring copy as the latest' do
        working_copy = create(:assessment)
        listing.update!(authoring_assessment: working_copy, current_version: version)

        labels = described_class.labels_for_assessments([working_copy.id])

        expect(labels[working_copy.id][:latest]).to be(false)
      end

      # A listing id is a primary key: deleting a neighbouring listing renumbers nothing, and the flag
      # is read off THIS listing's own pointer. This is the case that motivated the feature — an admin
      # deleted listing 3 and expected listing 4 to become 3.
      it 'is unaffected by the deletion of another listing' do
        listing.update!(current_version: version)
        other = create(:course_assessment_marketplace_listing)
        create(:course_assessment_marketplace_listing_version, listing: other)
        other.destroy!

        labels = described_class.labels_for_assessments([version.assessment_id])

        expect(labels[version.assessment_id][:listing_id]).to eq(listing.id)
        expect(labels[version.assessment_id][:latest]).to be(true)
      end

      it 'reports a published listing as listed' do
        labels = described_class.labels_for_assessments([version.assessment_id])

        expect(labels[version.assessment_id][:listed]).to be(true)
      end

      it 'reports an unlisted listing as not listed' do
        listing.update!(published: false)

        labels = described_class.labels_for_assessments([version.assessment_id])

        expect(labels[version.assessment_id][:listed]).to be(false)
      end

      # `listed` reads the `published` COLUMN, never `admin_state`: an orphaned listing has lost its
      # authoring copy but goes on serving its last snapshot and stays published. Reading the raw
      # column avoids coupling this query to what `admin_state` currently means.
      it 'still reports an orphaned but published listing as listed' do
        listing.update!(authoring_assessment: nil)

        labels = described_class.labels_for_assessments([version.assessment_id])

        expect(labels[version.assessment_id][:listed]).to be(true)
      end

      # Listing state belongs to the LISTING, so the working copy carries it too — its row is as
      # unlisted as every snapshot of the same listing.
      it 'reports the listing state on the authoring copy too' do
        working_copy = create(:assessment)
        listing.update!(authoring_assessment: working_copy, published: false)

        labels = described_class.labels_for_assessments([working_copy.id])

        expect(labels[working_copy.id][:listed]).to be(false)
      end
    end

    # `published_at` is a plain column. The v1 special case that used to live in a method here moved
    # to write time in PublishService#cut_first_version!, where the listing's first-publication date
    # is what actually dates the content.
    describe '#published_at' do
      it 'reads the column verbatim, with no version-dependent branch' do
        published = 3.months.ago.change(usec: 0)
        listing.update!(first_published_at: 1.year.ago)
        version = create(:course_assessment_marketplace_listing_version, listing: listing,
                                                                        published_at: published)

        expect(version.published_at).to be_within(1.second).of(published)
      end
    end
  end
end
