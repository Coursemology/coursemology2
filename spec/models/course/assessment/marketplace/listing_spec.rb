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
  end
end
