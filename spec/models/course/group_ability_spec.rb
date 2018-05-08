# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Group do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:user) { create(:user) }
    let!(:group) { create(:course_group, course: course) }

    context 'when the user is a Course Staff' do
      let!(:course_manager) { create(:course_teaching_assistant, course: course, user: user) }

      it { is_expected.to be_able_to(:manage, group) }

      it 'sees all groups' do
        expect(course.groups.accessible_by(subject)).to contain_exactly(group)
      end
    end

    context 'when the user is a Course Observer' do
      let!(:course_observer) { create(:course_observer, course: course, user: user) }

      it { is_expected.to be_able_to(:read, group) }
      it { is_expected.not_to be_able_to(:manage, group) }
    end

    context 'when the user is a Group Manager' do
      let!(:course_user) { create(:course_user, course: course, user: user) }
      let!(:course_group_manager) do
        create(:course_group_manager, course_user: course_user, group: group)
      end

      it { is_expected.to be_able_to(:manage, group.reload) }

      it 'sees all groups' do
        expect(course.groups.accessible_by(subject)).to contain_exactly(group)
      end
    end
  end
end
