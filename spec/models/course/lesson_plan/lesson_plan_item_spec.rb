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

    describe 'personal times' do
      let(:student1) { create(:course_student, course: course) }
      let(:student2) { create(:course_student, course: course) }
      let(:personal_time1) do
        personal_time = lesson_plan_item.find_or_create_personal_time_for(student1)
        personal_time.save!
        personal_time
      end
      let(:personal_time2) do
        personal_time = lesson_plan_item.find_or_create_personal_time_for(student2)
        personal_time.save!
        personal_time
      end

      it 'creates a personal time for course_user' do
        student1
        student2
        expect(personal_time1.course_user).to eq student1
        expect(personal_time1.lesson_plan_item).to eq lesson_plan_item
        [:start_at, :end_at, :bonus_end_at].each do |attrib|
          expect(personal_time1.send(attrib).to_i).to eq lesson_plan_item.send(attrib).to_i
        end
      end

      it 'does not load personal times for a non-course_user' do
        expect(lesson_plan_item.personal_time_for(nil)).to be nil
      end

      it 'eager loads personal times for course_user' do
        personal_time1
        items = Course::LessonPlan::Item.where(id: lesson_plan_item).with_personal_times_for(student1).to_a
        expect(items.first.personal_times.loaded?).to be true
        expect(items.first.personal_time_for(student1)).to eq personal_time1
      end

      it 'does not eager load personal times for another course_user' do
        personal_time1
        personal_time2
        items = Course::LessonPlan::Item.where(id: lesson_plan_item).with_personal_times_for(student2).to_a
        expect(items.first.personal_times.loaded?).to be true
        expect(items.first.personal_time_for(student1)).to be nil
        expect(items.first.personal_time_for(student2)).to eq personal_time2
      end

      it 'eager loads reference times for course_user' do
        default_rt = lesson_plan_item.default_reference_time
        items = Course::LessonPlan::Item.where(id: lesson_plan_item).with_reference_times_for(student1).to_a
        expect(items.first.reference_times.loaded?).to be true
        expect(items.first.reference_time_for(student1)).to eq default_rt
      end

      describe '#time_for' do
        context 'when personal time exists' do
          it 'returns the personal time' do
            personal_time1
            time_for = lesson_plan_item.time_for(student1)
            expect(time_for.is_a?(Course::PersonalTime)).to be true
            expect(time_for).to eq personal_time1
          end
        end

        context 'when personal time does not exist' do
          it 'returns the reference time' do
            reference_time = lesson_plan_item.reference_time_for(student2)
            time_for = lesson_plan_item.time_for(student2)
            expect(time_for.is_a?(Course::ReferenceTime)).to be true
            expect(time_for).to eq reference_time
          end
        end

        context 'when loading for a non-course_user' do
          it 'returns the reference time' do
            default_reference_time = lesson_plan_item.default_reference_time
            expect(lesson_plan_item.time_for(nil)).to eq default_reference_time
          end
        end
      end
    end
  end
end
