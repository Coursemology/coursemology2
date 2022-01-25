# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject(:ability) { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }

    context 'when the user is a Course Student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:show, forum) }
    end

    context 'when the user is a Course Teaching Staff' do
      let(:course_user) { create(:course_teaching_assistant, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, forum) }
    end

    context 'when the user is a Course Observer' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:read, forum) }
      it { is_expected.not_to be_able_to(:manage, forum) }
    end
  end
end
