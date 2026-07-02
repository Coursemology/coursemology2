# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Gradebook::ExternalContribution do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:external) { create(:course_external_assessment, course: course) }

    describe 'validations' do
      it 'is valid with an external assessment and matching course' do
        expect(build(:course_gradebook_external_contribution,
                     external_assessment: external, course: course)).to be_valid
      end

      it 'requires an external assessment' do
        contribution = build(:course_gradebook_external_contribution,
                             external_assessment: external, course: course)
        contribution.external_assessment = nil
        expect(contribution).not_to be_valid
      end

      it 'enforces one row per external assessment' do
        create(:course_gradebook_external_contribution, external_assessment: external, course: course)
        duplicate = build(:course_gradebook_external_contribution, external_assessment: external, course: course)
        expect(duplicate).not_to be_valid
      end

      it 'rejects a course that does not match the external assessment course' do
        contribution = build(:course_gradebook_external_contribution, external_assessment: external)
        contribution.course = create(:course)
        expect(contribution).not_to be_valid
      end

      it 'rejects a negative weight' do
        expect(build(:course_gradebook_external_contribution,
                     external_assessment: external, course: course, weight: -1)).not_to be_valid
      end

      it 'rejects a weight above 100' do
        expect(build(:course_gradebook_external_contribution,
                     external_assessment: external, course: course, weight: 101)).not_to be_valid
      end

      it 'accepts a weight of exactly 100' do
        expect(build(:course_gradebook_external_contribution,
                     external_assessment: external, course: course, weight: 100)).to be_valid
      end
    end

    describe 'dependent destroy' do
      it 'is destroyed when its external assessment is destroyed' do
        create(:course_gradebook_external_contribution, external_assessment: external, course: course)
        expect { external.destroy! }.to change { described_class.count }.by(-1)
      end
    end

    describe '.bulk_update' do
      let(:ext1) { create(:course_external_assessment, course: course) }
      let(:ext2) { create(:course_external_assessment, course: course) }

      def weight_for(external)
        described_class.find_by(external_assessment_id: external.id)&.weight
      end

      it 'upserts a contribution per external, decoding the negative tab_id' do
        described_class.bulk_update(
          course: course,
          updates: [{ tab_id: -ext1.id, weight: 60 }, { tab_id: -ext2.id, weight: 40 }]
        )
        expect(weight_for(ext1)).to eq(60)
        expect(weight_for(ext2)).to eq(40)
        expect(described_class.find_by(external_assessment_id: ext1.id).course_id).to eq(course.id)
      end

      it 'is a no-op for an empty updates array' do
        expect { described_class.bulk_update(course: course, updates: []) }.
          not_to change(described_class, :count)
      end

      it 'is transactional — an invalid weight rolls everything back' do
        create(:course_gradebook_external_contribution, external_assessment: ext1, course: course, weight: 10)
        expect do
          described_class.bulk_update(
            course: course,
            updates: [{ tab_id: -ext1.id, weight: 50 }, { tab_id: -ext2.id, weight: 999 }]
          )
        end.to raise_error(ActiveRecord::RecordInvalid)
        expect(weight_for(ext1)).to eq(10)
      end

      it 'rejects an external assessment from another course' do
        other = create(:course_external_assessment, course: create(:course))
        expect do
          described_class.bulk_update(course: course, updates: [tab_id: -other.id, weight: 50])
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
