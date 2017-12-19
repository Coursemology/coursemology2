# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Item, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:lesson_plan_items) }
  it { is_expected.to have_many(:todos).inverse_of(:item).dependent(:destroy) }

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

    describe 'published' do
      let!(:other_lesson_plan_item) do
        create(:course_lesson_plan_item, course: course, published: true)
      end

      subject do
        lesson_plan_item
        Course::LessonPlan::Item.published
      end

      it { is_expected.not_to include(lesson_plan_item) }
      it { is_expected.to include(other_lesson_plan_item) }
    end

    describe '#set_default_values' do
      subject do
        item = Course::LessonPlan::Item.new
        item.base_exp + item.time_bonus_exp
      end

      it { is_expected.to eq 0 }
    end

    describe '#validations' do
      subject { lesson_plan_item }

      it { is_expected.to validate_numericality_of(:base_exp).is_greater_than_or_equal_to(0) }
      it { is_expected.to validate_numericality_of(:time_bonus_exp).is_greater_than_or_equal_to(0) }

      context 'when time_bonus_exp is set without bonus_end_at' do
        let(:lesson_plan_item) do
          build(:course_lesson_plan_item, time_bonus_exp: 100, bonus_end_at: nil)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors[:bonus_end_at]).to be_present
        end
      end

      context 'when start_at is after end_at' do
        let(:lesson_plan_item) do
          build(:course_lesson_plan_item, start_at: 1.day.ago, end_at: 3.days.ago)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors[:start_at]).to be_present
        end
      end

      context 'when start_at is before end_at' do
        let(:lesson_plan_item) do
          build(:course_lesson_plan_item, start_at: 3.days.ago, end_at: 1.day.ago)
        end

        it 'is valid' do
          expect(subject).to be_valid
          expect(subject.errors[:start_at]).not_to be_present
        end
      end
    end

    context 'when actable object is declared to have a todo' do
      describe 'callbacks from Course::LessonPlan::TodoConcern' do
        let(:course) { create(:course) }
        let!(:students) { create_list(:course_student, 3, course: course) }
        let(:actable) { create(:assessment, :with_mcq_question, course: course) }
        subject { create(:assessment, :published_with_mcq_question, course: course).acting_as }

        it 'creates todos for created objects for course_users' do
          todos_for_course =
            Course::LessonPlan::Todo.where(item_id: course.lesson_plan_items.select(:id))
          expect { subject }.to change(todos_for_course, :count).by(course.course_users.count)
        end
      end
    end
  end
end
