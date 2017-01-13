# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Conditional::ConditionalSatisfiabilityEvaluationService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#evaluate' do
      let(:course_user) { create(:course_user, course: course) }
      let!(:achievement) do
        create(:course_achievement, :with_level_condition, course: course)
      end
      let!(:unpublished_achievement) do
        create(:course_achievement, :with_level_condition, course: course, published: false)
      end

      context 'when course user satisfy the level condition' do
        it 'adds the satisfied achievement conditional to the course user' do
          allow(course_user).to receive(:level_number).and_return(2)
          subject.evaluate(course_user)
          expect(course_user.achievements).to include(achievement)
          expect(course_user.achievements).not_to include(unpublished_achievement)
        end
      end

      context 'when course user do not satisfy the level condition' do
        it 'does not adds the unsatisfied achievement conditional to the course user' do
          subject.evaluate(course_user)

          expect(course_user.achievements).not_to include(achievement)
        end
      end
    end
  end
end
