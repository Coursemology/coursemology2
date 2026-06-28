# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::GradebookAbilityComponent do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }

    context 'when the user is a Course Manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }
      it { is_expected.to be_able_to(:read_gradebook, course) }
      it { is_expected.to be_able_to(:manage_gradebook_weights, course) }
      it { is_expected.to be_able_to(:manage_gradebook_settings, course) }
      it 'cannot read the gradebook of a different course' do
        other_course = create(:course)
        expect(subject).not_to be_able_to(:read_gradebook, other_course)
      end
    end

    context 'when the user is a Course Owner' do
      let(:course_user) { create(:course_owner, course: course) }
      let(:user) { course_user.user }
      it { is_expected.to be_able_to(:read_gradebook, course) }
      it { is_expected.to be_able_to(:manage_gradebook_weights, course) }
      it { is_expected.to be_able_to(:manage_gradebook_settings, course) }
      it 'cannot read the gradebook of a different course' do
        other_course = create(:course)
        expect(subject).not_to be_able_to(:read_gradebook, other_course)
      end
    end

    context 'when the user is a Teaching Assistant' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }
      it { is_expected.not_to be_able_to(:read_gradebook, course) }
      it { is_expected.not_to be_able_to(:manage_gradebook_weights, course) }
      it { is_expected.not_to be_able_to(:manage_gradebook_settings, course) }
    end

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }
      it { is_expected.not_to be_able_to(:read_gradebook, course) }
      it { is_expected.not_to be_able_to(:manage_gradebook_weights, course) }
      it { is_expected.not_to be_able_to(:manage_gradebook_settings, course) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }
      it { is_expected.not_to be_able_to(:read_gradebook, course) }
      it { is_expected.not_to be_able_to(:manage_gradebook_weights, course) }
      it { is_expected.not_to be_able_to(:manage_gradebook_settings, course) }
    end
  end
end
