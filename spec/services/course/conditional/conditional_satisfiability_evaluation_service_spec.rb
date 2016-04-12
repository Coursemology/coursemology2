# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Conditional::ConditionalSatisfiabilityEvaluationService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#evaluate' do
      let(:course_user) { create(:course_user, course: course) }
      let!(:level_condition) { create(:level_condition, course: course) }
      let!(:achievement) do
        create(:course_achievement, course: course, conditions: [level_condition])
      end

      context 'when course user satisfy the level condition' do
        it 'adds the satisfied achievement conditional to the course user' do
          allow(course_user).to receive(:level_number).and_return(2)
          # TODO: Check that the achievement was added to the course user once achievement's API
          # are added in
          subject.evaluate(course_user)
        end
      end

      context 'when course user do not satisfy the level condition' do
        it 'does not adds the unsatisfied achievement conditional to the course user' do
          # TODO: Check that course user do not have the achievement once achievement's API are
          # added in
          subject.evaluate(course_user)
        end
      end
    end
  end
end
