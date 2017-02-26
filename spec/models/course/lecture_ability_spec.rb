# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Lecture do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let!(:not_started_lecture) { create(:course_lecture, :not_started, course: course) }
    let!(:ended_lecture) { create(:course_lecture, :ended, course: course) }
    let!(:valid_lecture) { create(:course_lecture, course: course) }

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      it { is_expected.to be_able_to(:show, valid_lecture) }
      it { is_expected.to be_able_to(:show, ended_lecture) }
      it { is_expected.to be_able_to(:show, not_started_lecture) }
      it { is_expected.not_to be_able_to(:manage, valid_lecture) }

      it 'sees the started lectures' do
        expect(course.lectures.accessible_by(subject)).
          to contain_exactly(valid_lecture, ended_lecture, not_started_lecture)
      end
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:manage, valid_lecture) }
      it { is_expected.to be_able_to(:manage, ended_lecture) }
      it { is_expected.to be_able_to(:manage, not_started_lecture) }

      it 'sees all lectures' do
        expect(course.lectures.accessible_by(subject)).
          to contain_exactly(not_started_lecture, valid_lecture, ended_lecture)
      end
    end
  end
end
