# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course, type: :model do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:read_statistics, course) }
    end

    context 'when the user is a Course Teaching Assistant' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:read_statistics, course) }
    end

    context 'when the user is a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:read_statistics, course) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:read_statistics, course) }
    end
  end
end
