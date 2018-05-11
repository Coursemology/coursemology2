# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Item do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:unpublished_item) { create(:course_lesson_plan_item, course: course) }
    let(:lesson_plan_item) { create(:course_lesson_plan_item, course: course, published: true) }

    context 'when the user is a Course Teaching Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      it { is_expected.to be_able_to(:manage, lesson_plan_item) }
      it { is_expected.to be_able_to(:show, unpublished_item) }

      it 'allows him to see all lesson plan items' do
        expect(course.lesson_plan_items.accessible_by(subject)).
          to contain_exactly(lesson_plan_item)
      end
    end

    context 'when the user is a Course Observer' do
      let(:user) { create(:course_observer, course: course).user }

      it { is_expected.to be_able_to(:show, lesson_plan_item) }
      it { is_expected.to be_able_to(:show, unpublished_item) }
    end

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      it { is_expected.to be_able_to(:show, lesson_plan_item) }
      it { is_expected.not_to be_able_to(:show, unpublished_item) }
      it { is_expected.not_to be_able_to(:manage, lesson_plan_item) }

      it 'allows him to see all lesson plan items' do
        expect(course.lesson_plan_items.accessible_by(subject)).
          to contain_exactly(lesson_plan_item)
      end
    end
  end
end
