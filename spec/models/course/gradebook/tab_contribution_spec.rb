# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Gradebook::TabContribution do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:category) { create(:course_assessment_category, course: course) }
    let(:tab) { create(:course_assessment_tab, category: category) }

    describe 'validations' do
      it 'is valid with a tab and matching course' do
        expect(build(:course_gradebook_tab_contribution, tab: tab, course: course)).to be_valid
      end

      it 'requires a tab' do
        contribution = build(:course_gradebook_tab_contribution, tab: tab, course: course)
        contribution.tab = nil
        expect(contribution).not_to be_valid
      end

      it 'enforces one row per tab' do
        create(:course_gradebook_tab_contribution, tab: tab, course: course)
        duplicate = build(:course_gradebook_tab_contribution, tab: tab, course: course)
        expect(duplicate).not_to be_valid
      end

      it 'rejects a course that does not match the tab course' do
        contribution = build(:course_gradebook_tab_contribution, tab: tab)
        contribution.course = create(:course)
        expect(contribution).not_to be_valid
      end

      it 'rejects a negative weight' do
        contribution = build(:course_gradebook_tab_contribution, tab: tab, course: course, weight: -1)
        expect(contribution).not_to be_valid
      end

      it 'rejects a weight above 100' do
        contribution = build(:course_gradebook_tab_contribution, tab: tab, course: course, weight: 101)
        expect(contribution).not_to be_valid
      end

      it 'accepts a weight of exactly 100' do
        contribution = build(:course_gradebook_tab_contribution, tab: tab, course: course, weight: 100)
        expect(contribution).to be_valid
      end

      it 'requires a weight_mode' do
        contribution = build(:course_gradebook_tab_contribution, tab: tab, course: course)
        contribution.weight_mode = nil
        expect(contribution).not_to be_valid
      end

      it 'defaults weight 0, mode equal' do
        contribution = create(:course_gradebook_tab_contribution, tab: tab, course: course)
        expect(contribution.weight).to eq(0)
        expect(contribution.weight_mode).to eq('equal')
      end
    end

    describe 'dependent destroy' do
      it 'is destroyed when its tab is destroyed' do
        create(:course_assessment_tab, category: category) # sibling so the tab is deletable
        create(:course_gradebook_tab_contribution, tab: tab, course: course)
        expect { tab.destroy! }.to change { described_class.count }.by(-1)
      end
    end

    describe '.bulk_update' do
      let(:tab1) { create(:course_assessment_tab, category: category) }
      let(:tab2) { create(:course_assessment_tab, category: category) }

      def weight_for(tab)
        described_class.find_by(tab_id: tab.id)&.weight
      end

      it 'upserts a contribution per given tab' do
        described_class.bulk_update(
          course: course,
          updates: [{ tab_id: tab1.id, weight: 60 }, { tab_id: tab2.id, weight: 40 }]
        )
        expect(weight_for(tab1)).to eq(60)
        expect(weight_for(tab2)).to eq(40)
        expect(described_class.find_by(tab_id: tab1.id).course_id).to eq(course.id)
        expect(described_class.where(tab_id: [tab1.id, tab2.id]).count).to eq(2)
      end

      it 'is a no-op for an empty updates array' do
        expect do
          described_class.bulk_update(course: course, updates: [])
        end.not_to change(described_class, :count)
      end

      it 'is transactional — an invalid value rolls everything back' do
        create(:course_gradebook_tab_contribution, tab: tab1, course: course, weight: 10)
        create(:course_gradebook_tab_contribution, tab: tab2, course: course, weight: 20)
        expect do
          described_class.bulk_update(
            course: course,
            updates: [{ tab_id: tab1.id, weight: 50 }, { tab_id: tab2.id, weight: 999 }]
          )
        end.to raise_error(ActiveRecord::RecordInvalid)
        expect(weight_for(tab1)).to eq(10)
        expect(weight_for(tab2)).to eq(20)
      end

      it 'rejects a foreign tab_id' do
        other_course = create(:course)
        other_tab = create(:course_assessment_tab,
                           category: create(:course_assessment_category, course: other_course))
        expect do
          described_class.bulk_update(course: course, updates: [tab_id: other_tab.id, weight: 50])
        end.to raise_error(ActiveRecord::RecordNotFound)
      end

      context 'with assessments in the tab' do
        let(:tab) { create(:course_assessment_tab, category: category) }
        let!(:a1) { create(:assessment, course: course, tab: tab) }
        let!(:a2) { create(:assessment, course: course, tab: tab) }

        def assessment_weight(assessment)
          assessment.reload.gradebook_assessment_contribution&.weight
        end

        def excluded?(assessment)
          assessment.reload.gradebook_assessment_contribution&.excluded
        end

        it 'persists custom mode + assessment weights that sum to the tab total' do
          described_class.bulk_update(
            course: course,
            updates: [
              tab_id: tab.id, weight: 50.0, weight_mode: 'custom',
              assessment_weights: [
                { assessment_id: a1.id, weight: 30.0 },
                { assessment_id: a2.id, weight: 20.0 }
              ]
            ]
          )
          expect(tab.reload.gradebook_contribution.weight_mode).to eq('custom')
          expect(assessment_weight(a1)).to eq(30.0)
          expect(assessment_weight(a2)).to eq(20.0)
        end

        it 'raises RecordInvalid when custom weights do not sum to the tab total' do
          expect do
            described_class.bulk_update(
              course: course,
              updates: [
                tab_id: tab.id, weight: 50.0, weight_mode: 'custom',
                assessment_weights: [
                  { assessment_id: a1.id, weight: 30.0 },
                  { assessment_id: a2.id, weight: 5.0 }
                ]
              ]
            )
          end.to raise_error(ActiveRecord::RecordInvalid)
          expect(assessment_weight(a1)).to be_nil # rolled back
        end

        it 'nulls assessment weights when switching the tab to equal mode' do
          create(:course_gradebook_assessment_contribution, assessment: a1, weight: 30.0)
          described_class.bulk_update(
            course: course,
            updates: [tab_id: tab.id, weight: 50.0, weight_mode: 'equal']
          )
          expect(tab.reload.gradebook_contribution.weight_mode).to eq('equal')
          expect(assessment_weight(a1)).to be_nil
        end

        it 'persists per-assessment exclusion in equal mode' do
          described_class.bulk_update(
            course: course,
            updates: [tab_id: tab.id, weight: 50.0, weight_mode: 'equal',
                      excluded_assessment_ids: [a1.id]]
          )
          expect(excluded?(a1)).to eq(true)
          expect(excluded?(a2)).to eq(false)
        end

        it 'drops excluded assessments from the custom balance check and keeps their weight' do
          described_class.bulk_update(
            course: course,
            updates: [
              tab_id: tab.id, weight: 30.0, weight_mode: 'custom',
              excluded_assessment_ids: [a2.id],
              assessment_weights: [
                { assessment_id: a1.id, weight: 30.0 },
                { assessment_id: a2.id, weight: 20.0 }
              ]
            ]
          )
          expect(excluded?(a1)).to eq(false)
          expect(excluded?(a2)).to eq(true)
          expect(assessment_weight(a2)).to eq(20.0) # retained for restore, not zeroed
        end

        it 'skips the custom balance check when every assessment is excluded' do
          expect do
            described_class.bulk_update(
              course: course,
              updates: [
                tab_id: tab.id, weight: 30.0, weight_mode: 'custom',
                excluded_assessment_ids: [a1.id, a2.id],
                assessment_weights: [
                  { assessment_id: a1.id, weight: 0.0 },
                  { assessment_id: a2.id, weight: 0.0 }
                ]
              ]
            )
          end.not_to raise_error
        end

        it 'raises RecordNotFound when a custom assessment weight targets an assessment outside the tab' do
          foreign = create(:assessment, course: course)
          expect do
            described_class.bulk_update(
              course: course,
              updates: [
                tab_id: tab.id, weight: 50.0, weight_mode: 'custom',
                assessment_weights: [{ assessment_id: foreign.id, weight: 50.0 }]
              ]
            )
          end.to raise_error(ActiveRecord::RecordNotFound)
        end

        it 're-including a previously excluded assessment clears the flag' do
          create(:course_gradebook_assessment_contribution, assessment: a1, excluded: true)
          described_class.bulk_update(
            course: course,
            updates: [tab_id: tab.id, weight: 50.0, weight_mode: 'equal', excluded_assessment_ids: []]
          )
          expect(excluded?(a1)).to eq(false)
        end
      end
    end
  end
end
