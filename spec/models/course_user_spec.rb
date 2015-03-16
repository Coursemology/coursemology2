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

  context 'when course_user is created' do
    subject { CourseUser.new }

    it { is_expected.to be_student }
    it { is_expected.not_to be_phantom }
  end

  let!(:instance) { create :instance }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:student) { create(:course_student, course: course) }
    let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
    let(:manager) { create(:course_manager, course: course) }
    let(:owner) { create(:course_owner, course: course) }

    describe '.staff' do
      it 'returns teaching assistant, manager and owner' do
        expect(course.course_users.staff).to contain_exactly(teaching_assistant, manager, owner)
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
        expect(course.course_users.owner).to contain_exactly(owner)
      end
    end

    describe '.approved' do
      before do
        student.approve!
        teaching_assistant.approve!
      end

      it 'returns all approved course users' do
        expect(course.course_users.with_approved_state).to contain_exactly(student,
                                                                           teaching_assistant)
      end
    end

    describe '.pending' do
      before { owner.approve! }

      it 'returns all pending course users' do
        expect(course.course_users.with_pending_state).
          to contain_exactly(student, teaching_assistant, manager)
      end
    end

    describe '#staff?' do
      it 'returns true if the role is teaching assistant, manager or owner' do
        expect(student.staff?).to be_falsey
        expect(teaching_assistant.staff?).to be_truthy
        expect(manager.staff?).to be_truthy
        expect(owner.staff?).to be_truthy
      end
    end

    describe '#approve!' do
      subject { student.tap(&:approve!) }
      it 'increases approved course users\' count' do
        expect { subject }.to change(CourseUser.with_approved_state, :count).by(1)
      end
    end

    describe '#exp_points' do
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

    context 'registering the same user to the same course twice' do
      subject do
        create(:course_student, course: student.course, user: student.user, role: :student)
      end

      it 'fails' do
        expect { subject }.to change(CourseUser, :count).by(0).and raise_error
      end
    end
  end
end
