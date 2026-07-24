# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::Listing, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    it { is_expected.to belong_to(:assessment).class_name('Course::Assessment') }
    it { is_expected.to belong_to(:publisher).class_name('User') }
    it do
      is_expected.to have_many(:adoptions).
        class_name('Course::Assessment::Marketplace::Adoption').dependent(:destroy)
    end

    describe 'validations' do
      subject { build(:course_assessment_marketplace_listing) }

      it { is_expected.to validate_presence_of(:publisher) }

      it 'validates uniqueness of assessment_id' do
        existing = create(:course_assessment_marketplace_listing)
        dup = build(:course_assessment_marketplace_listing, assessment: existing.assessment)
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
        expect(listing.fallback_maintainer).to be_nil
        expect(listing).to be_valid
      end

      it 'has many ordered versions and can point at a current version' do
        v1 = create(:course_assessment_marketplace_listing_version, listing: listing, version: 1)
        v2 = create(:course_assessment_marketplace_listing_version, listing: listing, version: 2)
        listing.update!(current_version: v2)
        expect(listing.versions).to contain_exactly(v1, v2)
        expect(listing.current_version).to eq(v2)
      end

      it 'destroys its versions when destroyed' do
        create(:course_assessment_marketplace_listing_version, listing: listing, version: 1)
        expect { listing.destroy }.
          to change { Course::Assessment::Marketplace::ListingVersion.count }.by(-1)
      end

      it 'does not destroy versions belonging to another listing' do
        other_listing = create(:course_assessment_marketplace_listing)
        other_version = create(:course_assessment_marketplace_listing_version,
                               listing: other_listing, version: 1)
        create(:course_assessment_marketplace_listing_version, listing: listing, version: 1)

        expect { listing.destroy }.
          to change { Course::Assessment::Marketplace::ListingVersion.count }.by(-1)
        expect(other_version.reload).to be_persisted
      end

      it 'optionally references a source course, fallback maintainer, and provenance' do
        course = create(:course)
        maintainer = create(:user)
        listing.update!(source_course: course, source_course_name: 'Intro to AI',
                        source_course_code: 'CS2109S',
                        source_academic_period: 'AY2024/25 Sem 1',
                        fallback_maintainer: maintainer)
        expect(listing.source_course).to eq(course)
        expect(listing.fallback_maintainer).to eq(maintainer)
        expect(listing.source_course_name).to eq('Intro to AI')
        expect(listing.source_course_code).to eq('CS2109S')
        expect(listing.source_academic_period).to eq('AY2024/25 Sem 1')
      end
    end
  end
end
