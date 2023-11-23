# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course, type: :model do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let!(:closed_course) { create(:course, published: false, enrollable: false) }
    let!(:published_course) { create(:course, :published) }
    let!(:enrollable_course) { create(:course, :enrollable) }

    context 'when the user is a Normal User' do
      let(:course_user) { nil }
      let(:user) { create(:user) }

      it { is_expected.not_to be_able_to(:show, published_course) }
      it { is_expected.not_to be_able_to(:show, enrollable_course) }
      it { is_expected.not_to be_able_to(:show, closed_course) }
      it { is_expected.not_to be_able_to(:show_users, course) }
      it { is_expected.not_to be_able_to(:manage_users, course) }
      it { is_expected.not_to be_able_to(:manage_personal_times, course) }
    end

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, course) }
      it { is_expected.not_to be_able_to(:manage, course) }
      it { is_expected.not_to be_able_to(:show_users, course) }
      it { is_expected.not_to be_able_to(:manage_users, course) }
      it { is_expected.not_to be_able_to(:manage_personal_times, course) }
    end

    context 'when the user is a Course Teaching Assistant' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, course) }
      it { is_expected.not_to be_able_to(:manage, course) }
      it { is_expected.to be_able_to(:show_users, course) }
      it { is_expected.not_to be_able_to(:manage_users, course) }
      it { is_expected.to be_able_to(:manage_personal_times, course) }
    end

    context 'when the user is a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, course) }
      it { is_expected.to be_able_to(:manage, course) }
      it { is_expected.to be_able_to(:show_users, course) }
      it { is_expected.to be_able_to(:manage_users, course) }
      it { is_expected.to be_able_to(:manage_personal_times, course) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, course) }
      it { is_expected.not_to be_able_to(:manage, course) }
      it { is_expected.to be_able_to(:show_users, course) }
      it { is_expected.not_to be_able_to(:manage_users, course) }
      it { is_expected.not_to be_able_to(:manage_personal_times, course) }
    end
  end
end
