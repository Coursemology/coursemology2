require 'rails_helper'

RSpec.describe CourseUser, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:course_users) }
  it { is_expected.to belong_to(:course).inverse_of(:course_users) }
  it { is_expected.to have_one(:invitation).validate(true) }
  it { is_expected.to define_enum_for(:role) }
  it do
    is_expected.to have_many(:experience_points_records).
      inverse_of(:course_user).
      dependent(:destroy)
  end
  it { is_expected.to have_one(:invitation) }
  it { is_expected.to have_many(:course_user_achievements).inverse_of(:course_user) }
  it { is_expected.to have_many(:achievements) }

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    let(:owner) { create(:user) }
    let(:course) { create(:course, creator: owner, updater: owner) }
    let!(:student) { create(:course_student, course: course) }
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

    describe '.approved' do
      before do
        student.approve!
        student.save!
        teaching_assistant.approve!
        teaching_assistant.save!
      end

      it 'returns all approved course users' do
        expect(course.course_users.with_approved_state).to contain_exactly(student,
                                                                           teaching_assistant,
                                                                           course_owner)
      end
    end

    describe '.pending' do
      it 'returns all pending course users' do
        expect(course.course_users.with_requested_state).
          to contain_exactly(student, teaching_assistant, manager)
      end
    end

    describe '#staff?' do
      it 'returns true if the role is teaching assistant, manager or owner' do
        expect(student.staff?).to be_falsey
        expect(teaching_assistant.staff?).to be_truthy
        expect(manager.staff?).to be_truthy
        expect(course_owner.staff?).to be_truthy
      end
    end

    describe '#approve!' do
      subject { student.tap(&:approve!).tap(&:save!) }
      it 'increases approved course users\' count' do
        expect { subject }.to change(CourseUser.with_approved_state, :count).by(1)
      end
    end

    describe '#reject!' do
      subject { student.tap(&:reject!) }
      it 'destroys the record' do
        expect(subject.destroyed?).to be_truthy
      end
    end

    describe '#level_number' do
      subject { student.level_number }
      before do
        create :course_level, course: course, experience_points_threshold: 100
        create :course_level, course: course, experience_points_threshold: 200
      end

      context 'when student has no experience points' do
        it { is_expected.to eq(0) }
      end

      context 'after enough experience points have been awarded' do
        before do
          create :course_experience_points_record, points_awarded: 150, course_user: student
        end
        it { is_expected.to eq(1) }
      end
    end

    describe '#experience_points' do
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

    context 'when the same user is registered into the same course twice' do
      subject do
        create(:course_student, course: student.course, user: student.user, role: :student)
      end

      it 'fails' do
        expect { subject }.to change(CourseUser, :count).by(0).
          and raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
