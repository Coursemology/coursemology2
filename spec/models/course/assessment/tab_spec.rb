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
  end
end
