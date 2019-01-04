# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::PersonalTime, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_user) { create(:course_user, course: course) }
    let(:lesson_plan_item) { create(:course_lesson_plan_item, course: course) }
    let(:personal_time) { course_user.personal_times.new(lesson_plan_item: lesson_plan_item) }

    describe '#validations' do
      subject { personal_time }

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
    end
  end
end
