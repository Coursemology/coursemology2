# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Level do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let!(:level) { create(:course_level, course: course) }
    let!(:default_level) { course.reload.levels.first }

    context 'when the user is a Course Teaching Staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }

      it { is_expected.to be_able_to(:manage, level) }
      it { is_expected.not_to be_able_to(:destroy, default_level) }

      it 'sees all levels' do
        expect(course.levels.accessible_by(subject)).to contain_exactly(*course.reload.levels)
      end
    end

    context 'when the user is a Course Observer' do
      let(:user) { create(:course_observer, course: course).user }

      it { is_expected.to be_able_to(:read, level) }
      it { is_expected.not_to be_able_to(:manage, level) }
      it { is_expected.not_to be_able_to(:destroy, default_level) }
    end
  end
end
