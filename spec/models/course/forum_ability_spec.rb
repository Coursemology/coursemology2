# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Forum, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject(:ability) { Ability.new(user) }
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      it { is_expected.to be_able_to(:show, forum) }
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:manage, forum) }
    end
  end
end
