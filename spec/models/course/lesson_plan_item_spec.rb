# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Item, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:lesson_plan_items) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:lesson_plan_item) { create(:course_lesson_plan_item, course: course) }

    describe 'ordered_by_date' do
      let(:other_lesson_plan_item) { create(:course_lesson_plan_item, course: course) }

      it 'orders the items by date' do
        lesson_plan_item
        other_lesson_plan_item
        consecutive = course.lesson_plan_items.each_cons(2)
        expect(consecutive.to_a).not_to be_empty
        expect(consecutive.all? { |first, second| first.start_at <= second.start_at })
      end
    end

    describe '#total_exp' do
      it 'equals base exp plus bonuses' do
        sum = lesson_plan_item.base_exp +
              lesson_plan_item.time_bonus_exp +
              lesson_plan_item.extra_bonus_exp
        expect(lesson_plan_item.total_exp).to eq sum
      end
    end

    describe '#set_default_values' do
      subject { Course::LessonPlan::Item.new.total_exp }
      it { is_expected.to eq 0 }
    end

    describe '#validations' do
      context 'when time_bonus_exp is set without bonus_end_at' do
        let(:lesson_plan_item) do
          build(:course_lesson_plan_item, time_bonus_exp: 100, bonus_end_at: nil)
        end

        it 'is not valid' do
          expect(lesson_plan_item).not_to be_valid
          expect(lesson_plan_item.errors[:bonus_end_at]).to be_present
        end
      end
    end
  end
end
