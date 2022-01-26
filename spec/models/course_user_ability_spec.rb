# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user, course_user.course, course_user) }
    let(:course_user_mate) { create(:course_student) }

    context 'when the user is from the same course' do
      let(:course_user) { create(:course_student, course: course_user_mate.course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:read, course_user_mate) }
    end

    context 'when the user is from a different course' do
      let(:course_user) { create(:course_student) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:read, course_user_mate) }
    end
  end
end
