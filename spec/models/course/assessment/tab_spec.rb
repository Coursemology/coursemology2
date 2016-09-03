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
  end
end
