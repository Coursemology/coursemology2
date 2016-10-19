# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Milestone do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:lesson_plan_milestone) { create(:course_lesson_plan_milestone, course: course) }

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:manage, lesson_plan_milestone) }

      it 'sees all lesson plan milestones' do
        expect(course.lesson_plan_milestones.accessible_by(subject)).
          to contain_exactly(lesson_plan_milestone)
      end
    end

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      it { is_expected.to be_able_to(:show, lesson_plan_milestone) }
      it { is_expected.not_to be_able_to(:manage, lesson_plan_milestone) }

      it 'sees all lesson plan milestones' do
        expect(course.lesson_plan_milestones.accessible_by(subject)).
          to contain_exactly(lesson_plan_milestone)
      end
    end
  end
end
