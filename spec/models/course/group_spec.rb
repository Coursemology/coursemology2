# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Group, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:groups) }
  it { is_expected.to have_many(:group_users).inverse_of(:group).dependent(:destroy) }
  it { is_expected.to have_many(:course_users).through(:group_users) }

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    describe '#initialize' do
      let(:owner) { create(:user) }
      let(:course) { create(:course, creator: owner) }
      let(:course_owner) { course.course_users.find_by(user: owner) }
      subject { Course::Group.new(course: course, name: 'group') }

      # TODO: Remove when using Rails 5.0
      self::MANAGER_ROLE = Course::GroupUser.roles[:manager]

      context 'when the group creator is a course_user of the course' do
        subject { Course::Group.new(course: course, creator: owner) }

        it 'sets the group creator as the manager of the group' do
          expect(subject.group_users.length).to eq(1)
          group_manager = subject.group_users.first
          expect(group_manager.course_user).to eq(course_owner)
          expect(group_manager.role).to eq('manager')
        end
      end

      context 'when the group creator is not a course_user of the course' do
        let(:other_course) { create(:course) }
        let(:other_course_creator) { other_course.course_users.find_by(user: other_course.creator) }
        subject { Course::Group.new(course: other_course, creator: owner) }

        it 'sets the course owner as the manager of the group' do
          expect(subject.group_users.length).to eq(1)
          group_manager = subject.group_users.first
          expect(group_manager.course_user).to eq(other_course_creator)
          expect(group_manager.role).to eq('manager')
        end
      end

      context 'when a user is provided after creation' do
        before do
          subject.creator = subject.updater = owner
          subject.save!
        end
        it 'sets the user as the owner of the group' do
          expect(subject.group_users.exists?(course_user: course_owner,
                                             role: self.class::MANAGER_ROLE)).
            to be_truthy
        end
      end

      context 'when multiple group_users reference a same user' do
        subject { create(:course_group, course: course) }
        let(:course_user) { create(:course_user, course: course) }
        let!(:group_users) { Array.new(2) { subject.group_users.build(course_user: course_user) } }

        it 'is an invalid group' do
          expect(subject.save).to be(false)
          expect(subject).not_to be_valid
        end

        it 'adds errors to group users' do
          subject.valid?
          user_with_errors = subject.group_users.select { |group_user| !group_user.errors.empty? }
          expect(user_with_errors).not_to be_empty
          user_with_errors.each do |group_user|
            expect(group_user.errors.messages[:course_user]).
              to include(I18n.t('errors.messages.taken'))
          end
        end
      end
    end
  end
end
