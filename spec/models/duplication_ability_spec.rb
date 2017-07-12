# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course, type: :model do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let!(:course) { create(:course, :enrollable) }

    context 'when the user is a Normal User' do
      let(:user) { create(:user) }

      it { is_expected.not_to be_able_to(:duplicate, course) }
    end

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      it { is_expected.not_to be_able_to(:duplicate, course) }
    end

    context 'when the user is a Course Teaching Assistant' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      it { is_expected.not_to be_able_to(:duplicate, course) }
    end

    context 'when the user is a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:duplicate, course) }
    end
  end
end
