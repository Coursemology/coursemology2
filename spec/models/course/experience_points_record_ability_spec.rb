require 'rails_helper'

RSpec.describe Course::ExperiencePointsRecord do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:course_student) { create(:course_student, :approved, course: course) }
    let(:reason) { 'Reasonable reason' }
    let(:points_awarded) { 100 }
    let(:experience_points_record) do
      create(:course_experience_points_record, reason: reason, course_user: course_student)
    end

    context 'when the user is a Course Student' do
      let(:subject_course_student) { create(:course_student, :approved, course: course) }
      let(:user) { subject_course_student.user }
      let(:subject_experience_points_record) do
        create(:course_experience_points_record,
               reason: reason,
               course_user: subject_course_student)
      end

      describe 'for experience points records belonging a classmate' do
        it { is_expected.not_to be_able_to(:create, experience_points_record) }
        it { is_expected.not_to be_able_to(:read, experience_points_record) }
        it { is_expected.not_to be_able_to(:update, experience_points_record) }
        it { is_expected.not_to be_able_to(:destroy, experience_points_record) }
      end

      describe 'for experience points records belong him/herself' do
        it { is_expected.not_to be_able_to(:create, subject_experience_points_record) }
        it { is_expected.to be_able_to(:read, subject_experience_points_record) }
        it { is_expected.not_to be_able_to(:update, subject_experience_points_record) }
        it { is_expected.not_to be_able_to(:destroy, subject_experience_points_record) }
      end

      it "cannot access classmate's experience points history" do
        expect(course_student.experience_points_records.accessible_by(subject)).
          to be_empty
      end

      it 'can access his/her own experience points history' do
        expect(subject_course_student.experience_points_records.accessible_by(subject)).
          to contain_exactly(subject_experience_points_record)
      end
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, :approved, course: course).user }
      let(:another_experience_points_record) do
        create(:course_experience_points_record)
      end

      describe 'for records belonging a student from the same course' do
        it { is_expected.to be_able_to(:create, experience_points_record) }
        it { is_expected.to be_able_to(:read, experience_points_record) }
        it { is_expected.to be_able_to(:update, experience_points_record) }
        it { is_expected.to be_able_to(:destroy, experience_points_record) }
      end

      describe 'for records belonging a student from a different course' do
        it { is_expected.not_to be_able_to(:create, another_experience_points_record) }
        it { is_expected.not_to be_able_to(:read, another_experience_points_record) }
        it { is_expected.not_to be_able_to(:update, another_experience_points_record) }
        it { is_expected.not_to be_able_to(:destroy, another_experience_points_record) }
      end

      it "can access Course Student's experience points history" do
        expect(course_student.experience_points_records.accessible_by(subject)).
          to contain_exactly(experience_points_record)
      end
    end
  end
end
