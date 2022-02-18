# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Material do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user, course, course_user) }
    let(:course) { create(:course) }
    let(:condition) { create(:material_condition, course: course) }

    context 'when the user is a Course Staff' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:manage, condition) }
    end
  end
end
