require 'rails_helper'

RSpec.describe Course::Assessment::Category do
  it { is_expected.to belong_to(:course) }
  it { is_expected.to have_many(:tabs) }
  it { is_expected.to have_many(:assessments).through(:tabs) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.default_scope' do
      let(:course) { create(:course) }
      let!(:categories) { create_list(:course_assessment_category, 2, course: course) }
      it 'orders by ascending weight' do
        weights = course.assessment_categories.map(&:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
