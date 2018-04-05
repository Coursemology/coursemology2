# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Group, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:groups) }
  it { is_expected.to have_many(:group_users).inverse_of(:group).dependent(:destroy) }
  it { is_expected.to have_many(:course_users).through(:group_users) }

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    let(:owner) { create(:user) }
    let(:course) { create(:course, creator: owner) }
    let(:course_owner) { course.course_users.find_by(user: owner) }
    let(:group) { create(:course_group, course: course) }

    describe '#initialize' do
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
          user_with_errors = subject.group_users.reject { |group_user| group_user.errors.empty? }
          expect(user_with_errors).not_to be_empty
          user_with_errors.each do |group_user|
            expect(group_user.errors.messages[:course_user]).
              to include(I18n.t('errors.messages.taken'))
          end
        end
      end
    end

    describe '#average_achievement_count' do
      subject { group.average_achievement_count }

      context 'when there are no group users' do
        it { is_expected.to eq(0) }
      end

      context 'when there are one or more group users' do
        let(:student) { create(:course_student, course: course) }
        let!(:group_user) { create(:course_group_user, group: group, course_user: student) }
        let!(:other_group_user) { create(:course_group_user, course: course, group: group) }
        let!(:achievements) { create_list(:course_user_achievement, 5, course_user: student) }

        it 'returns the average achievement count' do
          average_count = 1.0 * student.course_user_achievements.count /
                          group.course_users.students.count
          expect(subject).to eq(average_count)
        end
      end
    end

    describe '#average_experience_points' do
      subject { group.average_experience_points }

      context 'when there are no group users' do
        it { is_expected.to eq(0) }
      end

      context 'when there are one or more group users' do
        let(:student) { create(:course_student, course: course) }
        let!(:group_user) { create(:course_group_user, group: group, course_user: student) }
        let!(:other_group_user) { create(:course_group_user, course: course, group: group) }
        let!(:experience_points) do
          create_list(:course_experience_points_record, 2, course_user: student)
        end

        it 'returns the average experience points' do
          average_count = 1.0 * group.course_users.map(&:experience_points).inject(:+) /
                          group.course_users.students.count
          expect(subject).to eq(average_count)
        end
      end
    end

    describe '#last_obtained_achievement' do
      subject { group.last_obtained_achievement }

      context 'when the group has no achievement' do
        it { is_expected.to be_falsey }
      end

      context 'when the group has 1 or more achievements' do
        let(:student) { create(:course_student, course: course) }
        let!(:group_user) { create(:course_group_user, group: group, course_user: student) }
        let!(:later_achievement) { create(:course_user_achievement, course_user: student) }
        let!(:earlier_achievement) do
          create(:course_user_achievement, course_user: student,
                                           obtained_at: later_achievement.obtained_at - 1.day)
        end

        it 'returns the last obtained achievement' do
          expect(subject).to eq(later_achievement.obtained_at)
        end
      end
    end

    describe '.ordered_by_experience_points' do
      let(:student) { create(:course_student, course: course) }
      let!(:group_user) { create(:course_group_user, group: group, course_user: student) }
      let!(:other_group) { create(:course_group, course: course) }
      let!(:experience_points_record) do
        create(:course_experience_points_record, course_user: student)
      end

      it 'returns groups sorted by average experience points' do
        course.groups.ordered_by_experience_points.each_cons(2) do |group1, group2|
          expect(group1.average_experience_points).to be >= group2.average_experience_points
        end
      end
    end

    describe '.ordered_by_achievement_count' do
      let(:student) { create(:course_student, course: course) }
      let!(:group_user) { create(:course_group_user, group: group, course_user: student) }
      let!(:course_user_achievement) { create(:course_user_achievement, course_user: student) }
      let!(:later_group) { create(:course_group, course: course) }

      it 'returns groups sorted by average achievement count' do
        course.groups.ordered_by_average_achievement_count.each_cons(2) do |group1, group2|
          expect(group1.average_achievement_count).to be >= group2.average_achievement_count
        end
      end

      context 'when two groups have the same achievement count' do
        let(:earlier_time) { course_user_achievement.obtained_at }
        let!(:later_student) { create(:course_student, course: course) }
        let!(:later_group_user) do
          create(:course_group_user, group: later_group, course_user: later_student)
        end
        let!(:later_student_achievement) do
          create(:course_user_achievement, course_user: later_student,
                                           obtained_at: earlier_time + 2.days)
        end

        it 'returns the group who obtained the achievement count first' do
          expect(group.average_achievement_count).to eq(later_group.average_achievement_count)
          course.groups.ordered_by_average_achievement_count.each_cons(2) do |group1, group2|
            expect(group1.last_obtained_achievement).to be <= group2.last_obtained_achievement
          end
        end
      end
    end
  end
end
