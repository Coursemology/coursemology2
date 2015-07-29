require 'rails_helper'

RSpec.describe Course::Group, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:groups) }
  it { is_expected.to have_many(:group_users).inverse_of(:course_group).dependent(:destroy) }
  it { is_expected.to have_many(:users).through(:group_users) }

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    describe '#initialize' do
      let(:owner) { create(:user) }
      let(:course) { create(:course, creator: owner) }
      subject { Course::Group.new(course: course, name: 'group') }

      # TODO: Remove when using Rails 5.0
      self::MANAGER_ROLE = Course::GroupUser.roles[:manager]

      context 'when a user is provided' do
        subject { Course::Group.new(course: course, creator: owner) }
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
          expect(subject.group_users.exists?(user: owner, role: self.class::MANAGER_ROLE)).to \
            be_truthy
        end
      end

      context 'when multiple group_users reference a same user' do
        subject { create(:course_group, course: course) }
        let(:user) { create(:user) }
        let!(:group_users) do
          create(:course_user, course: course, user: user)
          2.times.map { subject.group_users.build(user: user) }
        end

        it 'is an invalid group' do
          expect(subject.save).to be(false)
          expect(subject).not_to be_valid
        end

        it 'adds errors to group users' do
          subject.valid?
          user_with_errors = subject.group_users.select { |user| user.errors.any? }
          expect(user_with_errors).not_to be_empty
          user_with_errors.each do |user|
            expect(user.errors.messages[:user]).to include(I18n.t('errors.messages.taken'))
          end
        end
      end
    end
  end
end
