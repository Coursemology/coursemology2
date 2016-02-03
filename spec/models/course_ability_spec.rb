# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course, type: :model do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let!(:closed_course) { create(:course, :closed) }
    let!(:published_course) { create(:course, :published) }
    let!(:opened_course) { create(:course, :opened) }

    context 'when the user is a Normal User' do
      let(:user) { create(:user) }

      it { is_expected.to be_able_to(:show, published_course) }
      it { is_expected.to be_able_to(:show, opened_course) }
      it { is_expected.not_to be_able_to(:show, closed_course) }

      it 'sees the opened courses' do
        expect(Course.accessible_by(subject)).
          to contain_exactly(published_course, opened_course)
      end
    end

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }

      it { is_expected.to be_able_to(:show, course) }
      it { is_expected.not_to be_able_to(:manage, course) }
    end

    context 'when the user is a Course Teaching Assistant' do
      let(:user) { create(:course_teaching_assistant, :approved, course: course).user }

      it { is_expected.to be_able_to(:show, course) }
      it { is_expected.not_to be_able_to(:manage, course) }
    end

    context 'when the user is a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      it { is_expected.to be_able_to(:show, course) }
      it { is_expected.to be_able_to(:manage, course) }
    end
  end
end
