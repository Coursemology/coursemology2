# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Tab do
  it { is_expected.to belong_to(:category) }
  it { is_expected.to have_many(:assessments).dependent(:destroy) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '.default_scope' do
      let(:course) { create(:course) }
      let(:category) { create(:course_assessment_category, course: course) }
      let!(:tabs) { create_list(:course_assessment_tab, 2, course: course, category: category) }
      it 'orders by ascending weight' do
        weights = category.tabs.map(&:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end

    describe 'gradebook_weight validation' do
      let(:tab) { create(:course_assessment_tab) }

      it 'defaults to 0' do
        expect(tab.gradebook_weight).to eq(0)
      end

      it 'accepts 0..100 integers' do
        [0, 50, 100].each do |w|
          tab.gradebook_weight = w
          expect(tab).to be_valid
        end
      end

      it 'rejects negative' do
        tab.gradebook_weight = -1
        expect(tab).not_to be_valid
        expect(tab.errors[:gradebook_weight]).to be_present
      end

      it 'rejects >100' do
        tab.gradebook_weight = 101
        expect(tab).not_to be_valid
      end

      it 'rejects non-integer' do
        tab.gradebook_weight = 50.5
        expect(tab).not_to be_valid
      end

      it 'rejects nil' do
        tab.gradebook_weight = nil
        expect(tab).not_to be_valid
      end
    end

    describe '.update_gradebook_weights' do
      let(:course) { create(:course) }
      let(:category) { create(:course_assessment_category, course: course) }
      let(:tab1) { create(:course_assessment_tab, category: category) }
      let(:tab2) { create(:course_assessment_tab, category: category) }

      it 'updates given tabs' do
        described_class.update_gradebook_weights(
          course: course,
          updates: [{ tab_id: tab1.id, weight: 60 }, { tab_id: tab2.id, weight: 40 }]
        )
        expect(tab1.reload.gradebook_weight).to eq(60)
        expect(tab2.reload.gradebook_weight).to eq(40)
      end

      it 'is transactional — invalid value rolls back everything' do
        tab1.update!(gradebook_weight: 10)
        tab2.update!(gradebook_weight: 20)
        expect do
          described_class.update_gradebook_weights(
            course: course,
            updates: [{ tab_id: tab1.id, weight: 50 }, { tab_id: tab2.id, weight: 999 }]
          )
        end.to raise_error(ActiveRecord::RecordInvalid)
        expect(tab1.reload.gradebook_weight).to eq(10)
        expect(tab2.reload.gradebook_weight).to eq(20)
      end

      it 'rejects foreign tab_id' do
        other_course = create(:course)
        other_tab = create(:course_assessment_tab,
                           category: create(:course_assessment_category, course: other_course))
        expect do
          described_class.update_gradebook_weights(
            course: course,
            updates: [tab_id: other_tab.id, weight: 50]
          )
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
