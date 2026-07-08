# frozen_string_literal: true
require 'rails_helper'

RSpec.describe CourseUser, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:course_users) }
  it { is_expected.to belong_to(:course).inverse_of(:course_users) }
  it { is_expected.to define_enum_for(:role) }
  it { is_expected.to define_enum_for(:timeline_algorithm) }
  it do
    is_expected.to have_many(:experience_points_records).
      inverse_of(:course_user).
      dependent(:destroy)
  end
  it { is_expected.to have_many(:course_user_achievements).inverse_of(:course_user) }
  it { is_expected.to have_many(:achievements).through(:course_user_achievements) }
  it { is_expected.to have_many(:group_users).dependent(:destroy) }
  it { is_expected.to have_many(:groups).through(:group_users).source(:group) }
  it { is_expected.to have_many(:email_unsubscriptions).dependent(:destroy) }
  it { is_expected.to have_many(:learning_rate_records).dependent(:destroy) }

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

    describe 'external_id uniqueness' do
      let(:other_course) { create(:course, creator: owner, updater: owner) }

      it 'allows multiple course users with nil external_id in the same course' do
        create(:course_student, course: course, external_id: nil)
        new_student = build(:course_student, course: course, external_id: nil)
        expect(new_student).to be_valid
      end

      it 'normalizes blank external_id to nil' do
        student = create(:course_student, course: course, external_id: '')
        expect(student.reload.external_id).to be_nil
      end

      it 'is valid when external_id is unique in the course' do
        student = build(:course_student, course: course, external_id: 'unique-id')
        expect(student).to be_valid
      end

      context 'when another course user in the same course has the same external_id' do
        let!(:existing) { create(:course_student, course: course, external_id: 'dup-id') }

        it 'is invalid' do
          student = build(:course_student, course: course, external_id: 'dup-id')
          expect(student).not_to be_valid
          expect(student.errors[:external_id]).
            to include(I18n.t('activerecord.errors.models.course_user.attributes.external_id.taken'))
        end
      end

      context 'when a course user in a different course has the same external_id' do
        let!(:existing) { create(:course_student, course: other_course, external_id: 'some-id') }

        it 'is valid' do
          student = build(:course_student, course: course, external_id: 'some-id')
          expect(student).to be_valid
        end
      end

      context 'when a pending invitation in the same course has the same external_id' do
        let!(:invitation) { create(:course_user_invitation, course: course, external_id: 'pending-id') }

        it 'is invalid for a new record' do
          student = build(:course_student, course: course, external_id: 'pending-id')
          expect(student).not_to be_valid
        end

        it 'is invalid when updating an existing course user to match the pending invitation ext id' do
          student = create(:course_student, course: course, external_id: nil)
          expect(student.update(external_id: 'pending-id')).to be(false)
          expect(student.errors[:external_id]).
            to include(I18n.t('activerecord.errors.models.course_user.attributes.external_id.taken'))
        end

        it 'is invalid even when the course user DB id happens to equal the pending invitation DB id' do
          # Regression guard: validate_unique_external_id_within_course mistakenly applied
          # where.not(id: self.id) to the invitations query as well as the course_user query,
          # rather than just the course_user query ("don't compare me against myself").
          # So if a pending invitation claimed the same external_id, the check would
          # accidentally exclude it and incorrectly allow the external_id through.
          # This test ensures that collision is still caught when the IDs happen to match.
          student = create(:course_student, course: course, external_id: nil)
          allow(student).to receive(:id).and_return(invitation.id)

          student.external_id = 'pending-id'
          expect(student).not_to be_valid
          expect(student.errors[:external_id]).
            to include(I18n.t('activerecord.errors.models.course_user.attributes.external_id.taken'))
        end
      end

      context 'when only a confirmed invitation in the same course has the same external_id' do
        let!(:invitation) { create(:course_user_invitation, :confirmed, course: course, external_id: 'confirmed-id') }

        # The uniqueness check (UniqueExternalIdConcern) only queries unconfirmed invitations.
        # A confirmed invitation means the user has already joined the course, so their external_id
        # is now on the CourseUser record. The invitation row is no longer an active claim on the id.
        it 'is valid' do
          student = build(:course_student, course: course, external_id: 'confirmed-id')
          expect(student).to be_valid
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
        let!(:level1) { create(:course_level, course: course, experience_points_threshold: 100) }
        before do
          create(:course_experience_points_record, points_awarded: 150, course_user: student)
          course.reload
        end

        it 'returns the level 1 object' do
          expect(student.current_level).to eq(level1)
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
        let!(:exp_record1) { create(:course_experience_points_record) }
        let!(:exp_record2) do
          create(:course_experience_points_record, course_user: exp_record1.course_user)
        end
        subject { exp_record1.course_user }

        it 'sums all associated experience points records' do
          points_awarded = exp_record1.points_awarded + exp_record2.points_awarded
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

    describe '#suspended_from_course?' do
      def ability_for(course_user)
        Ability.new(course_user.user, course, course_user)
      end

      context 'when the course is not suspended' do
        it 'returns false for an active student' do
          expect(student.suspended_from_course?(ability_for(student))).to be false
        end

        it 'returns true for an individually suspended student' do
          student.update!(is_suspended: true)
          expect(student.suspended_from_course?(ability_for(student))).to be true
        end

        it 'returns false for an individually suspended manager' do
          manager.update!(is_suspended: true)
          expect(manager.suspended_from_course?(ability_for(manager))).to be false
        end

        it 'returns false for an individually suspended owner' do
          course_owner.update!(is_suspended: true)
          expect(course_owner.suspended_from_course?(ability_for(course_owner))).to be false
        end

        it 'returns true for an individually suspended teaching assistant' do
          teaching_assistant.update!(is_suspended: true)
          expect(teaching_assistant.suspended_from_course?(ability_for(teaching_assistant))).to be true
        end

        it 'returns true for an individually suspended observer' do
          observer.update!(is_suspended: true)
          expect(observer.suspended_from_course?(ability_for(observer))).to be true
        end
      end

      context 'when the course is suspended' do
        before { course.update!(is_suspended: true) }

        it 'returns true for an active student' do
          expect(student.suspended_from_course?(ability_for(student))).to be true
        end

        it 'returns false for a manager' do
          expect(manager.suspended_from_course?(ability_for(manager))).to be false
        end

        it 'returns false for an owner' do
          expect(course_owner.suspended_from_course?(ability_for(course_owner))).to be false
        end

        it 'returns false for a teaching assistant' do
          expect(teaching_assistant.suspended_from_course?(ability_for(teaching_assistant))).to be false
        end

        it 'returns false for an observer' do
          expect(observer.suspended_from_course?(ability_for(observer))).to be false
        end
      end
    end

    describe '#latest_learning_rate_record' do
      it 'returns the latest learning rate record' do
        create(:learning_rate_record, course_user: student, learning_rate: 1)
        create(:learning_rate_record, course_user: student, learning_rate: 1.1)
        latest = create(:learning_rate_record, course_user: student, learning_rate: 1.2)

        expect(student.latest_learning_rate_record).to eq(latest)
      end
    end

    context 'when there are students in groups' do
      let(:group_owner) { create(:course_manager, course: course) }
      let!(:group) do
        grp = create(:course_group, course: course)
        create(:course_group_user, course: course, group: grp, course_user: student)
        create(:course_group_manager, course: course, group: grp, course_user: group_owner)
        grp
      end

      describe '#my_students' do
        it 'returns all the normal students in the group' do
          expect(group_owner.my_students).to contain_exactly(student)
        end

        context 'when a non-student is a normal member of the group' do
          let!(:group_ta) { create(:course_teaching_assistant, course: course) }
          before { create(:course_group_user, course: course, group: group, course_user: group_ta) }

          it 'does not include the non-student' do
            expect(group_owner.my_students).not_to include(group_ta)
          end
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

      context 'when the course_user is created' do
        let!(:assessment) { create(:assessment, course: course) }
        subject { new_course_user }

        it 'creates todos for the lesson_plan_item for course_user' do
          expect { subject }.to change(user.todos, :count).by(1)
        end

        context 'but the assessment does not have todo' do
          let!(:assessment) { create(:assessment, :without_todo, course: course) }

          subject { new_course_user }

          it 'does not create todos for the lesson_plan_item for course_user' do
            expect { subject }.to change(user.todos, :count).by(0)
          end
        end
      end

      context 'when the course_user is destroyed' do
        let!(:assessment) { create(:assessment, course: course) }
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
