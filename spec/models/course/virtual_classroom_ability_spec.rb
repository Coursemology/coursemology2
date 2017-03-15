# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::VirtualClassroom do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let!(:not_started_virtual_classroom) do
      create(:course_virtual_classroom, :not_started, course: course)
    end
    let!(:ended_virtual_classroom) { create(:course_virtual_classroom, :ended, course: course) }
    let!(:valid_virtual_classroom) { create(:course_virtual_classroom, course: course) }

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      it { is_expected.to be_able_to(:show, valid_virtual_classroom) }
      it { is_expected.to be_able_to(:show, ended_virtual_classroom) }
      it { is_expected.to be_able_to(:show, not_started_virtual_classroom) }
      it { is_expected.not_to be_able_to(:manage, valid_virtual_classroom) }
      it { is_expected.not_to be_able_to(:access_recorded_videos, course) }

      it 'sees the started virtual_classrooms' do
        expect(course.virtual_classrooms.accessible_by(subject)).
          to contain_exactly(valid_virtual_classroom, ended_virtual_classroom,
                             not_started_virtual_classroom)
      end
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:manage, valid_virtual_classroom) }
      it { is_expected.to be_able_to(:manage, ended_virtual_classroom) }
      it { is_expected.to be_able_to(:manage, not_started_virtual_classroom) }

      it 'sees all virtual_classrooms' do
        expect(course.virtual_classrooms.accessible_by(subject)).
          to contain_exactly(not_started_virtual_classroom, valid_virtual_classroom,
                             ended_virtual_classroom)
      end
    end
  end
end
