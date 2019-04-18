# frozen_string_literal: true
require 'rails_helper'

RSpec.describe CourseUser, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:course_users) }
  it { is_expected.to belong_to(:course).inverse_of(:course_users) }
  it { is_expected.to define_enum_for(:role) }
  it do
    is_expected.to have_many(:experience_points_records).
      inverse_of(:course_user).
      dependent(:destroy)
  end
  it { is_expected.to have_many(:course_user_achievements).inverse_of(:course_user) }
  it { is_expected.to have_many(:achievements).through(:course_user_achievements) }
  it { is_expected.to have_many(:group_users).dependent(:destroy) }
  it { is_expected.to have_many(:groups).through(:group_users).source(:group) }

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    let(:owner) { create(:user) }
    let(:course) { create(:course, creator: owner, updater: owner) }
    let!(:student) { create(:course_student, course: course) }
    let(:phantom_student) { create(:course_student, :phantom, course: course) }
    let(:observer) { create(:course_observer, course: course) }
    let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
    let(:manager) { create(:course_manager, course: course) }
    let(:course_owner) { course.course_users.find_by!(user: owner) }

    describe '#initialize' do
      subject { CourseUser.new(course: course, creator: owner, updater: owner) }

      it { is_expected.to be_student }
      it { is_expected.not_to be_phantom }

      context 'when a user is provided' do
        let(:user) { create(:user) }
        subject { CourseUser.new(user: user) }
        it 'has the same name as the user' do
          expect(subject.name).to eq(subject.user.name)
        end
      end

      context 'when a user is provided after creation' do
        let(:user) { create(:user) }
        before do
          subject.user = user
          subject.save!
        end
        it 'has the same name as the user' do
          expect(subject.name).to eq(subject.user.name)
        end
      end
    end

    describe '.staff' do
      it 'returns teaching assistant, manager and owner' do
        expect(course.course_users.staff).to contain_exactly(teaching_assistant, manager,
                                                             course_owner)
      end
    end

    describe '.student' do
      it 'returns only student' do
        expect(course.course_users.student).to contain_exactly(student)
      end
    end

    describe '.observer' do
      it 'returns only observer' do
        expect(course.course_users.observer).to contain_exactly(observer)
      end
    end

    describe '.teaching_assistant' do
      it 'returns only teaching assistant' do
        expect(course.course_users.teaching_assistant).to contain_exactly(teaching_assistant)
      end
    end

    describe '.manager' do
      it 'returns only manager' do
        expect(course.course_users.manager).to contain_exactly(manager)
      end
    end

    describe '.owner' do
      it 'returns only owner' do
        expect(course.course_users.owner).to contain_exactly(course_owner)
      end
    end

    describe '.managers' do
      it 'returns only owner and manager' do
        expect(course.course_users.managers).to contain_exactly(course_owner, manager)
      end
    end

    describe '.ordered_by_experience_points' do
      let!(:student1) { create(:course_student, course: course) }

      it 'returns course_users sorted by experience points' do
        create(:course_experience_points_record, course_user: student)
        course.course_users.student.ordered_by_experience_points.each_cons(2) do |user1, user2|
          expect(user1.experience_points).to be >= user2.experience_points
        end
      end

      context 'when two course_users has the same experience_points obtained at different times' do
        let(:now) { Time.zone.now }
        before do
          create(:course_experience_points_record, course_user: student, points_awarded: 100,
                                                   awarded_at: now)
          create(:course_experience_points_record, course_user: student1, points_awarded: 100,
                                                   awarded_at: now - 1.day)
        end

        it 'returns course_users sorted by experience points' do
          expect(student1.experience_points).to eq(student.experience_points)
          course.course_users.student.ordered_by_experience_points.each_cons(2) do |user1, user2|
            time1 = user1.calculated(:last_experience_points_record).last_experience_points_record
            time2 = user2.calculated(:last_experience_points_record).last_experience_points_record
            expect(time1 < time2).to be_truthy
          end
        end
      end
    end

    describe '.ordered_by_achievement_count' do
      let!(:slower_student) { create(:course_student, course: course) }
      let!(:course_user_achievement) { create(:course_user_achievement, course_user: student) }
      subject { course.course_users.students.ordered_by_achievement_count }

      it 'returns course_users sorted by achievement count' do
        expect(subject).to eq([student, slower_student])
      end

      context 'when two course_users have the same achievement count' do
        let(:earliest_time) { course_user_achievement.obtained_at }
        let!(:student_achievement) do
          create(:course_user_achievement, course_user: student, obtained_at: earliest_time)
        end
        let!(:slower_student_achievement) do
          create_list(:course_user_achievement, 2, course_user: slower_student,
                                                   obtained_at: earliest_time + 2.days)
        end

        it 'returns the course_user who obtained the achievement count first' do
          # Student achieves the achievement count of 2 before slower_student
          expect(subject).to eq([student, slower_student])
        end
      end
    end

    describe '.without_phantom_users' do
      let!(:phantom_user) { create(:course_user, :phantom, course: course) }
      it 'returns only non-phantom course users' do
        expect(course.course_users.without_phantom_users).not_to include(phantom_user)
        course.course_users.without_phantom_users.each do |course_user|
          expect(course_user.phantom?).to be_falsey
        end
      end
    end

    describe '#staff?' do
      it 'returns true if the role is observer, teaching assistant, manager or owner' do
        expect(student.staff?).to be_falsey
        expect(observer.staff?).to be_truthy
        expect(teaching_assistant.staff?).to be_truthy
        expect(manager.staff?).to be_truthy
        expect(course_owner.staff?).to be_truthy
      end
    end

    describe '#teaching_staff?' do
      it 'returns true if the role is teaching assistant, manager or owner' do
        expect(student.teaching_staff?).to be_falsey
        expect(observer.teaching_staff?).to be_falsey
        expect(teaching_assistant.teaching_staff?).to be_truthy
        expect(manager.teaching_staff?).to be_truthy
        expect(course_owner.teaching_staff?).to be_truthy
      end
    end

    describe '#manager_or_owner?' do
      it 'returns true if the role is manager or owner' do
        expect(student.manager_or_owner?).to be_falsey
        expect(observer.manager_or_owner?).to be_falsey
        expect(teaching_assistant.manager_or_owner?).to be_falsey
        expect(manager.manager_or_owner?).to be_truthy
        expect(course_owner.manager_or_owner?).to be_truthy
      end
    end

    describe '#real_student?' do
      it 'returns true if the role is student and not phantom' do
        expect(student.real_student?).to be_truthy
        expect(phantom_student.real_student?).to be_falsey
        expect(observer.manager_or_owner?).to be_falsey
        expect(teaching_assistant.real_student?).to be_falsey
        expect(manager.real_student?).to be_falsey
        expect(course_owner.real_student?).to be_falsey
      end
    end

    describe '#current_level' do
      context 'when student has enough EXP to be level 1' do
        let!(:level_1) { create(:course_level, course: course, experience_points_threshold: 100) }
        before do
          create(:course_experience_points_record, points_awarded: 150, course_user: student)
          course.reload
        end

        it 'returns the level 1 object' do
          expect(student.current_level).to eq(level_1)
        end
      end
    end

    describe '#level_number' do
      subject { student.level_number }
      before do
        create(:course_level, course: course, experience_points_threshold: 100)
        create(:course_level, course: course, experience_points_threshold: 200)
        course.reload
      end

      context 'when student has no experience points' do
        it { is_expected.to eq(0) }
      end

      context 'after enough experience points have been awarded' do
        before do
          create(:course_experience_points_record, points_awarded: 150, course_user: student)
        end
        it 'returns the correct level number' do
          expect(subject).to eq(1)
        end
      end
    end

    describe '#level_progress_percentage' do
      subject { student.level_progress_percentage }
      before do
        create(:course_level, course: course, experience_points_threshold: 100)
        course.reload
      end

      it { is_expected.to be_a(Integer) }
      it { is_expected.to be_between(0, 100) }

      context 'when the course user has 0% of progress within the level' do
        it { is_expected.to eq(0) }
      end

      context 'when the course user has 99% of progress within the level' do
        before do
          create(:course_experience_points_record, points_awarded: 99, course_user: student)
        end

        it { is_expected.to eq(99) }
      end

      context 'when course user is at the maximum level' do
        before do
          create(:course_experience_points_record, points_awarded: 150, course_user: student)
        end
        it { is_expected.to eq(100) }
      end
    end

    describe '#experience_points' do
      context 'when there are no experience points record' do
        it 'returns zero' do
          expect(student.experience_points).to eq(0)
        end
      end

      context 'when there are one or more experience points records' do
        let!(:exp_record_1) { create(:course_experience_points_record) }
        let!(:exp_record_2) do
          create(:course_experience_points_record, course_user: exp_record_1.course_user)
        end
        subject { exp_record_1.course_user }

        it 'sums all associated experience points records' do
          points_awarded = exp_record_1.points_awarded + exp_record_2.points_awarded
          expect(subject.experience_points).to eq(points_awarded)
        end
      end
    end

    describe '#achievement_count' do
      subject { student.achievement_count }
      context 'when the user has no achievement' do
        it 'returns 0' do
          expect(subject).to eq(0)
        end
      end

      context 'when the user has one achievement' do
        before { create(:course_user_achievement, course_user: student) }
        it 'returns the accurate count' do
          expect(subject).to eq(1)
        end
      end
    end

    describe '#last_obtained_achievement' do
      subject { student.last_obtained_achievement }
      let!(:achievement) { create(:course_user_achievement, course_user: student) }
      before do
        create(:course_user_achievement, course_user: student,
                                         obtained_at: achievement.obtained_at - 1.day)
      end

      it 'returns the last obtained achievement' do
        expect(subject).to eq(achievement.obtained_at)
      end
    end

    describe '#ordered_by_date_obtained' do
      let(:achievement1) { create(:course_achievement, course: course, weight: 2) }
      let(:achievement2) { create(:course_achievement, course: course, weight: 1) }
      before do
        create(:course_user_achievement, course_user: student, achievement: achievement1)
        create(:course_user_achievement, course_user: student, achievement: achievement2)
      end

      it 'returns achievement by date obtained and not by achievement weight' do
        expect(student.achievements.ordered_by_date_obtained).to eq([achievement1, achievement2])
      end
    end

    context 'when there are students in groups' do
      let(:group_owner) { create(:course_manager, course: course) }
      before do
        group = create(:course_group, course: course, creator: group_owner.user)
        create(:course_group_user, course: course, group: group, course_user: student)
      end

      describe '#my_students' do
        it 'returns all the normal users in the group' do
          expect(group_owner.my_students).to contain_exactly(student)
        end
      end

      describe '#my_managers' do
        it 'returns the managers of the student' do
          expect(student.my_managers).to contain_exactly(group_owner)
        end
      end
    end

    context 'when the same user is registered into the same course twice' do
      subject do
        create(:course_student, course: student.course, user: student.user, role: :student)
      end

      it 'fails' do
        expect { subject }.to change(CourseUser, :count).by(0).
          and raise_error(ActiveRecord::RecordInvalid)
      end
    end

    describe 'CourseUser::TodoConcern' do
      let(:user) { create(:user) }
      let(:new_course_user) { create(:course_user, course: course, user: user) }
      let!(:assessment) { create(:assessment, course: course) }

      context 'when the course_user is created' do
        subject { new_course_user }

        it 'creates todos for the lesson_plan_item for course_user' do
          expect { subject }.to change(user.todos, :count).by(1)
        end
      end

      context 'when the course_user is destroyed' do
        let(:other_course) { create(:course) }
        let!(:other_assessment) { create(:assessment, course: other_course) }
        let(:new_course_user) { create(:course_user, course: course, user: user) }
        let(:other_course_user) { create(:course_user, course: other_course, user: user) }

        before do
          new_course_user
          other_course_user
        end
        subject { new_course_user.destroy }

        it 'only deletes the todos for current course' do
          expect(user.todos.count).to eq(2)
          expect { subject }.to change(user.todos, :count).by(-1)
        end
      end
    end
  end
end
