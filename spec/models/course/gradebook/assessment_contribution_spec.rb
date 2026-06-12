# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Gradebook::AssessmentContribution do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:tab) { create(:course_assessment_tab, course: course) }
    let(:assessment) { create(:assessment, course: course, tab: tab) }

    it { is_expected.to belong_to(:assessment) }

    it 'allows a nil weight (equal mode)' do
      contribution = build(:course_gradebook_assessment_contribution, assessment: assessment, weight: nil)
      expect(contribution).to be_valid
    end

    it 'rejects a negative weight' do
      contribution = build(:course_gradebook_assessment_contribution, assessment: assessment, weight: -1)
      expect(contribution).not_to be_valid
    end

    it 'defaults excluded to false' do
      contribution = create(:course_gradebook_assessment_contribution, assessment: assessment)
      expect(contribution.excluded).to eq(false)
    end

    it 'enforces one row per assessment' do
      create(:course_gradebook_assessment_contribution, assessment: assessment)
      duplicate = build(:course_gradebook_assessment_contribution, assessment: assessment)
      expect(duplicate).not_to be_valid
    end

    it 'is destroyed when its assessment is destroyed' do
      create(:course_gradebook_assessment_contribution, assessment: assessment)
      expect { assessment.destroy! }.to change { described_class.count }.by(-1)
    end
  end
end
