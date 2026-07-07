# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::Adoption, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    it { is_expected.to belong_to(:listing).class_name('Course::Assessment::Marketplace::Listing') }
    it { is_expected.to belong_to(:destination_course).class_name('Course') }
    it { is_expected.to belong_to(:duplicated_assessment).class_name('Course::Assessment') }

    it 'validates uniqueness of duplicated_assessment_id' do
      existing = create(:course_assessment_marketplace_adoption)
      dup = build(:course_assessment_marketplace_adoption,
                  duplicated_assessment: existing.duplicated_assessment)
      expect(dup).not_to be_valid
    end

    it 'is destroyed when its duplicated assessment is destroyed (DB cascade)' do
      adoption = create(:course_assessment_marketplace_adoption)
      adoption.duplicated_assessment.destroy
      expect(described_class.exists?(adoption.id)).to be(false)
    end
  end
end
