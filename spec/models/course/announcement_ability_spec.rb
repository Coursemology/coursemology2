# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Announcement do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let!(:not_started_announcement) { create(:course_announcement, :not_started, course: course) }
    let!(:ended_announcement) { create(:course_announcement, :ended, course: course) }
    let!(:valid_announcement) { create(:course_announcement, course: course) }

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      it { is_expected.to be_able_to(:show, valid_announcement) }
      it { is_expected.to be_able_to(:show, ended_announcement) }
      it { is_expected.not_to be_able_to(:show, not_started_announcement) }
      it { is_expected.not_to be_able_to(:manage, valid_announcement) }

      it 'sees the started announcements' do
        expect(course.announcements.accessible_by(subject)).
          to contain_exactly(valid_announcement, ended_announcement)
      end
    end

    context 'when the user is a Course Teaching Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      it { is_expected.to be_able_to(:manage, valid_announcement) }
      it { is_expected.to be_able_to(:manage, ended_announcement) }
      it { is_expected.to be_able_to(:manage, not_started_announcement) }

      it 'sees all announcements' do
        expect(course.announcements.accessible_by(subject)).
          to contain_exactly(not_started_announcement, valid_announcement, ended_announcement)
      end
    end

    context 'when the user is a Course Observer' do
      let(:user) { create(:course_observer, course: course).user }

      it { is_expected.to be_able_to(:read, valid_announcement) }
      it { is_expected.to be_able_to(:read, ended_announcement) }
      it { is_expected.to be_able_to(:read, not_started_announcement) }
      it { is_expected.not_to be_able_to(:manage, valid_announcement) }
      it { is_expected.not_to be_able_to(:manage, ended_announcement) }
      it { is_expected.not_to be_able_to(:manage, not_started_announcement) }
    end
  end
end
