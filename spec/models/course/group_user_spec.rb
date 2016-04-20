# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::GroupUser, type: :model do
  it { is_expected.to belong_to(:course_user).inverse_of(:group_users) }
  it { is_expected.to belong_to(:group).inverse_of(:group_users) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'when user is not enrolled in group\'s course' do
      let(:course_group) { create(:course_group) }
      let(:other_course_user) do
        other_course = create(:course)
        create(:course_user, course: other_course)
      end
      subject do
        build(:course_group_user, group: course_group, course_user: other_course_user)
      end

      it { is_expected.not_to be_valid }
    end
  end
end
