# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course, type: :model do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let!(:course) { create(:course, :enrollable) }

    context 'when the user is an administrator' do
      let(:user) { create(:user, :administrator) }
      let(:course_user) { nil }

      it { is_expected.to be_able_to(:duplicate_across_instances, instance) }
    end

    context 'when the user is an instance administrator but not an admin' do
      let(:user) { create(:instance_administrator).user }
      let(:course_user) { nil }

      it { is_expected.to be_able_to(:duplicate_across_instances, instance) }
    end

    context 'when the user is an instance instructor but not an admin' do
      let(:user) { create(:instance_user, :instructor).user }
      let(:course_user) { nil }

      it { is_expected.to be_able_to(:duplicate_across_instances, instance) }
    end

    context 'when the user is a Normal User' do
      let(:user) { create(:user) }
      let(:course_user) { nil }

      it { is_expected.not_to be_able_to(:duplicate_from, course) }
      it { is_expected.not_to be_able_to(:duplicate_to, course) }
      it { is_expected.not_to be_able_to(:duplicate_across_instances, instance) }
    end

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:duplicate_from, course) }
      it { is_expected.not_to be_able_to(:duplicate_to, course) }
      it { is_expected.not_to be_able_to(:duplicate_across_instances, instance) }
    end

    context 'when the user is a Course Teaching Assistant' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.not_to be_able_to(:duplicate_from, course) }
      it { is_expected.not_to be_able_to(:duplicate_to, course) }
      it { is_expected.not_to be_able_to(:duplicate_across_instances, instance) }
    end

    context 'when the user is a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:duplicate_from, course) }
      it { is_expected.to be_able_to(:duplicate_to, course) }
      it { is_expected.not_to be_able_to(:duplicate_across_instances, instance) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:duplicate_from, course) }
      it { is_expected.not_to be_able_to(:duplicate_to, course) }
      it { is_expected.not_to be_able_to(:duplicate_across_instances, instance) }
    end
  end
end
