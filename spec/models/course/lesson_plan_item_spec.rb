require 'rails_helper'

RSpec.describe Course::LessonPlanItem, type: :model do
  it { is_expected.to validate_numericality_of(:base_exp).only_integer }
  it { is_expected.to validate_numericality_of(:time_bonus_exp).only_integer }
  it { is_expected.to validate_numericality_of(:extra_bonus_exp).only_integer }
  it { is_expected.to belong_to(:course).inverse_of(:lesson_plan_items) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:lesson_plan_item) { FactoryGirl.create :course_lesson_plan_item }
    describe '#total_exp' do
      it 'equals base exp plus bonuses' do
        sum = lesson_plan_item.base_exp +
              lesson_plan_item.time_bonus_exp +
              lesson_plan_item.extra_bonus_exp
        expect(lesson_plan_item.total_exp).to eq sum
      end
    end

    describe '#set_default_values' do
      subject { Course::LessonPlanItem.new.total_exp }
      it { is_expected.to eq 0 }
    end
  end
end
