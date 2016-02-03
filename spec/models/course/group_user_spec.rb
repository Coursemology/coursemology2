# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::GroupUser, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:course_group_users) }
  it { is_expected.to belong_to(:course_group).inverse_of(:group_users) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { build(:course_group_user) }

    context 'when user is not enrolled in group\'s course' do
      before { subject.user.course_users.delete_all }
      it { is_expected.not_to be_valid }
    end
  end
end
