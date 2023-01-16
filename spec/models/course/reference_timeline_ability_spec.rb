# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ReferenceTimeline, type: :model do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let(:timeline) { create(:course_reference_timeline, course: course) }
    let(:item) { create(:course_lesson_plan_item, course: course) }
    let!(:time) { create(:course_reference_time, reference_timeline: timeline, lesson_plan_item: item) }

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:manage, timeline) }
      it { is_expected.not_to be_able_to(:manage, time) }
    end

    context 'when the user is a Course Teaching Assistant' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:manage, timeline) }
      it { is_expected.not_to be_able_to(:manage, time) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:manage, timeline) }
      it { is_expected.not_to be_able_to(:manage, time) }
    end

    context 'when the user is a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, timeline) }
      it { is_expected.to be_able_to(:manage, time) }
    end
  end
end
