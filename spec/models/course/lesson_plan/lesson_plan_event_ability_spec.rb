# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Event do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let(:lesson_plan_event) { create(:course_lesson_plan_event, course: course) }

    context 'when the user is a Course Staff' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, lesson_plan_event) }

      it 'allows him to see all lesson plan events' do
        expect(course.lesson_plan_events.accessible_by(subject)).
          to contain_exactly(lesson_plan_event)
      end
    end

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, lesson_plan_event) }
      it { is_expected.not_to be_able_to(:manage, lesson_plan_event) }

      it 'allows him to see all lesson plan events' do
        expect(course.lesson_plan_events.accessible_by(subject)).
          to contain_exactly(lesson_plan_event)
      end
    end
  end
end
