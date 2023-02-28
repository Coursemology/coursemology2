# frozen_string_literal: true
require 'rails_helper'

RSpec.describe DuplicationTraceable::LessonPlanItem, type: :model do
  it { is_expected.to act_as(DuplicationTraceable) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }
    let(:lesson_plan_item) { create(:course_lesson_plan_item, course: course) }

    subject do
      build(:duplication_traceable_lesson_plan_item, lesson_plan_item: nil, source: nil)
    end

    describe 'validations' do
      it 'validates the presence of a destination assessment' do
        expect(subject).to_not be_valid
        expect(subject.errors[:lesson_plan_item]).not_to be_empty
      end
    end

    describe '#source and #source=' do
      it 'correctly reads and updates the source' do
        expect(subject.source).to be(nil)
        subject.source = lesson_plan_item
        expect(subject.source).to eq(lesson_plan_item)
      end
    end

    describe '.dependent_class' do
      it 'returns Course::LessonPlan::Item' do
        expect(DuplicationTraceable::LessonPlanItem.dependent_class).to eq(Course::LessonPlan::Item.name)
      end
    end

    describe '.initialize_with_dest' do
      it 'creates an instance with the dest initialized' do
        traceable = DuplicationTraceable::LessonPlanItem.initialize_with_dest(lesson_plan_item)
        expect(traceable.lesson_plan_item).to eq(lesson_plan_item)
      end

      it 'passes in the other options correctly' do
        traceable = DuplicationTraceable::LessonPlanItem.initialize_with_dest(lesson_plan_item, creator: user)
        expect(traceable.creator).to eq(user)
      end
    end
  end
end
