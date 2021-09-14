# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Survey do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:condition) { create(:survey_condition, course: course) }

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:manage, condition) }
    end
  end
end
