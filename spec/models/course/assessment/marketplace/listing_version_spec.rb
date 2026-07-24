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

      it 'requires a positive integer version' do
        version = build(:course_assessment_marketplace_listing_version, listing: listing, version: 0)
        expect(version).not_to be_valid
        expect(version.errors[:version]).to be_present
      end

      it 'requires a version' do
        version = build(:course_assessment_marketplace_listing_version, listing: listing, version: nil)
        expect(version).not_to be_valid
        expect(version.errors[:version]).to be_present
      end

      it 'requires an integer version' do
        version = build(:course_assessment_marketplace_listing_version, listing: listing, version: 1.5)
        expect(version).not_to be_valid
        expect(version.errors[:version]).to be_present
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

      it 'enforces version uniqueness scoped to the listing' do
        create(:course_assessment_marketplace_listing_version, listing: listing, version: 1)
        duplicate = build(:course_assessment_marketplace_listing_version, listing: listing, version: 1)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:version]).to be_present
      end

      it 'allows the same version number on a different listing' do
        create(:course_assessment_marketplace_listing_version, listing: listing, version: 1)
        other = build(:course_assessment_marketplace_listing_version,
                      listing: create(:course_assessment_marketplace_listing), version: 1)
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
      it 'orders by ascending version' do
        v2 = create(:course_assessment_marketplace_listing_version, listing: listing, version: 2)
        v1 = create(:course_assessment_marketplace_listing_version, listing: listing, version: 1)
        expect(listing.versions.ordered).to eq([v1, v2])
      end
    end
  end
end
