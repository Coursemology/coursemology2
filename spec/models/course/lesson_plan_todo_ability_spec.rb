# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Item do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:user) { create(:user) }
    let(:todo) { create(:course_lesson_plan_todo, user: user) }
    let(:other_user) { create(:user) }
    let(:other_todo) { create(:course_lesson_plan_todo, user: other_user) }

    context 'when the user is the user of the todo' do
      it { is_expected.to be_able_to(:ignore, todo) }
    end

    context 'when the user is not the user of the todo ' do
      it { is_expected.not_to be_able_to(:ignore, other_todo) }
    end
  end
end
