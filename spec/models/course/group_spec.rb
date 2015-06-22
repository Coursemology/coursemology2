require 'rails_helper'

RSpec.describe Course::Group, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:groups) }
  it { is_expected.to have_many(:group_users).inverse_of(:course_group).dependent(:destroy) }
  it { is_expected.to have_many(:users).through(:group_users) }

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    describe '#initialize' do
      let(:owner) { create(:user) }
      let(:course) { create(:course, creator: owner, updater: owner) }
      subject { Course::Group.new(course: course, name: 'group') }

      # TODO: Remove when using Rails 5.0
      MANAGER_ROLE = Course::GroupUser.roles[:manager]

      context 'when a user is provided' do
        subject { Course::Group.new(course: course, creator: owner, updater: owner) }
        it 'sets the user as the owner of the group' do
          expect(subject.group_users.length).to eq(1)
          owner_group_user = subject.group_users.first
          expect(owner_group_user.user).to eq(owner)
          expect(owner_group_user.role).to eq('manager')
        end
      end

      context 'when a user is provided after creation' do
        before do
          subject.creator = subject.updater = owner
          subject.save!
        end
        it 'sets the user as the owner of the group' do
          expect(subject.group_users.exists?(user: owner, role: MANAGER_ROLE)).to be_truthy
        end
      end

      context 'when multiple group_users reference a same user', focus: true do
        let(:group) { create(:course_group, course: course) }
        let(:user) { create(:user) }
        before do
          create(:course_user, course: course, user: user)
          2.times { group.group_users.build(user: user, creator: owner, updater: owner ) }
        end
        subject { group.save }

        it 'does not raise any errors' do
          expect{ subject }.not_to raise_error
        end

        it 'adds the user to the group' do
          subject
          expect(group.users).to include(user)
        end
      end
    end
  end
end
