# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ReferenceTime, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:lesson_plan_item) { create(:course_lesson_plan_item, course: course) }
    let(:reference_time) { lesson_plan_item.default_reference_time }

    it { should belong_to(:reference_timeline).inverse_of(:reference_times).without_validating_presence }
    it { should belong_to(:lesson_plan_item).inverse_of(:reference_times).without_validating_presence }

    describe '#validations' do
      subject { reference_time }

      context 'when end_at is missing' do
        it 'is valid' do
          subject.assign_attributes(start_at: 2.days.from_now, end_at: nil)
          expect(subject).to be_valid
          expect(subject.errors[:start_at]).not_to be_present
        end
      end

      context 'when start_at is before end_at' do
        it 'is valid' do
          subject.assign_attributes(start_at: 2.days.from_now, end_at: 3.days.from_now)
          expect(subject).to be_valid
          expect(subject.errors[:start_at]).not_to be_present
        end
      end

      context 'when start_at is after end_at' do
        it 'is not valid' do
          subject.assign_attributes(start_at: 3.days.from_now, end_at: 2.days.from_now)
          expect(subject).not_to be_valid
          expect(subject.errors[:start_at]).to be_present
        end
      end

      context 'when is a reference time in a default timeline' do
        it 'cannot be destroyed' do
          expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
          expect(subject.destroyed?).to be_falsey
          expect(subject.errors.messages).to have_key(:reference_timeline)
        end
      end

      context 'when is a reference time in a non-default timeline' do
        let(:timeline) { create(:course_reference_timeline, course: course) }

        before { subject.update!(reference_timeline: timeline) }

        context 'when destroyed' do
          it 'can be destroyed' do
            expect { subject.destroy! }.not_to raise_error
            expect(subject.destroyed?).to be_truthy
            expect(subject.errors.messages).to be_empty
          end

          it 'is removed from the formerly assigned lesson plan item' do
            expect { subject.destroy! }.to change { lesson_plan_item.reference_times.size }.by(-1)
            expect(subject.destroyed?).to be_truthy
          end

          it 'is removed from its reference timeline' do
            expect { subject.destroy! }.to change { timeline.reference_times.size }.by(-1)
            expect(subject.destroyed?).to be_truthy
          end
        end
      end

      context 'when about to be assigned to a lesson plan item in a different course' do
        let(:other_course) { create(:course) }
        let(:other_item) { create(:course_lesson_plan_item, course: other_course) }

        it 'cannot be assigned' do
          time_course_id = subject.reference_timeline.course.id
          other_item_course_id = other_item.course.id
          expect(time_course_id).not_to eq(other_item_course_id)

          expect { subject.update!(lesson_plan_item: other_item) }.to raise_error(ActiveRecord::RecordInvalid)
          expect(subject.errors.messages).to have_key(:lesson_plan_item)

          expect(subject.reload.lesson_plan_item.id).to eq(lesson_plan_item.id)
        end
      end
    end
  end
end
