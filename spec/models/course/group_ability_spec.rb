# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Group do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let(:user) { create(:user) }
    let!(:group_category1) { create(:course_group_category, course: course) }
    let!(:group_category2) { create(:course_group_category, course: course) }
    let!(:group1) { create(:course_group, group_category: group_category1) }
    let!(:group2) { create(:course_group, group_category: group_category1) }

    context 'when the user is a Course Staff' do
      let!(:course_user) { create(:course_teaching_assistant, course: course, user: user) }

      it { is_expected.to be_able_to(:manage, group1) }
      it { is_expected.to be_able_to(:manage, group2) }
      it { is_expected.to be_able_to(:manage, group_category1) }
      it { is_expected.to be_able_to(:manage, group_category2) }

      it 'sees all groups' do
        expect(course.groups.accessible_by(subject)).to contain_exactly(group1, group2)
      end

      it 'sees all group categories' do
        expect(course.group_categories.accessible_by(subject)).to contain_exactly(group_category1, group_category2)
      end
    end

    context 'when the user is a Course Observer' do
      let!(:course_user) { create(:course_observer, course: course, user: user) }

      it { is_expected.to be_able_to(:read, group1) }
      it { is_expected.to be_able_to(:read, group2) }
      it { is_expected.to be_able_to(:read, group_category1) }
      it { is_expected.to be_able_to(:read, group_category2) }
      it { is_expected.not_to be_able_to(:manage, group1) }
      it { is_expected.not_to be_able_to(:manage, group2) }
      it { is_expected.not_to be_able_to(:manage, group_category1) }
      it { is_expected.not_to be_able_to(:manage, group_category2) }
    end

    context 'when the user is a Group Manager' do
      let!(:course_user) { create(:course_user, course: course, user: user) }
      let!(:course_group_manager) do
        create(:course_group_manager, course_user: course_user, group: group1)
      end

      it { is_expected.to be_able_to(:manage, group1.reload) }
      it { is_expected.not_to be_able_to(:manage, group2) }
      it { is_expected.not_to be_able_to(:manage, group_category1.reload) }
      it { is_expected.not_to be_able_to(:manage, group_category2) }

      it 'sees only their group' do
        expect(course.groups.accessible_by(subject)).to contain_exactly(group1)
      end

      it 'sees only the group category containing their group' do
        expect(course.group_categories.accessible_by(subject)).to contain_exactly(group_category1)
      end
    end
  end
end
