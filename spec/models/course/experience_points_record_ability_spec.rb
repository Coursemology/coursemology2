# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExperiencePointsRecord do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let(:course_student) { create(:course_student, course: course) }
    let(:points_record) do
      create(:course_experience_points_record, course_user: course_student)
    end

    context 'when the user is a Course Student' do
      let(:course_user) { course_student }
      let(:user) { course_student.user }
      let(:classmate) { create(:course_student, course: course) }
      let(:classmate_points_record) do
        create(:course_experience_points_record, course_user: classmate)
      end

      context 'when experience points record belongs to a classmate' do
        it { is_expected.not_to be_able_to(:create, classmate_points_record) }
        it { is_expected.not_to be_able_to(:read, classmate_points_record) }
        it { is_expected.not_to be_able_to(:update, classmate_points_record) }
        it { is_expected.not_to be_able_to(:destroy, classmate_points_record) }
        it "cannot access classmate's experience points history" do
          expect(classmate.experience_points_records.accessible_by(subject)).
            to be_empty
        end
      end

      context 'when experience points record belongs to him/herself' do
        it { is_expected.not_to be_able_to(:create, points_record) }
        it { is_expected.to be_able_to(:read, points_record) }
        it { is_expected.not_to be_able_to(:update, points_record) }
        it { is_expected.not_to be_able_to(:destroy, points_record) }
        it 'can access his/her own experience points history' do
          expect(course_student.experience_points_records.accessible_by(subject)).
            to contain_exactly(points_record)
        end
      end
    end

    context 'when the user is a Course Teaching Staff' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }
      let(:foreign_points_record) { create(:course_experience_points_record) }

      context 'when record belongs to a student from the same course' do
        it { is_expected.to be_able_to(:create, points_record) }
        it { is_expected.to be_able_to(:read, points_record) }
        it { is_expected.to be_able_to(:update, points_record) }
        it { is_expected.to be_able_to(:destroy, points_record) }
        it "can access the student's experience points history" do
          expect(course_student.experience_points_records.accessible_by(subject)).
            to contain_exactly(points_record)
        end
      end

      context 'when record belongs to a student from the different course' do
        it { is_expected.not_to be_able_to(:create, foreign_points_record) }
        it { is_expected.not_to be_able_to(:read, foreign_points_record) }
        it { is_expected.not_to be_able_to(:update, foreign_points_record) }
        it { is_expected.not_to be_able_to(:destroy, foreign_points_record) }
        it "cannot access the student's experience points history" do
          records = foreign_points_record.course_user.experience_points_records
          expect(records.accessible_by(subject)).to be_empty
        end
      end
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      context 'when record belongs to a student from the same course' do
        it { is_expected.to be_able_to(:read, points_record) }
        it { is_expected.not_to be_able_to(:create, points_record) }
        it { is_expected.not_to be_able_to(:update, points_record) }
        it { is_expected.not_to be_able_to(:destroy, points_record) }
        it "can access the student's experience points history" do
          expect(course_student.experience_points_records.accessible_by(subject)).
            to contain_exactly(points_record)
        end
      end
    end
  end
end
