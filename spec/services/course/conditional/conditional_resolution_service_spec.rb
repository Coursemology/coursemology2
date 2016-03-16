# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Conditional::ConditionalResolutionService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#resolve' do
      let(:course_user) { create(:course_user, course: course) }
      let!(:level_condition) { create(:level_condition, course: course) }
      let!(:achievement) do
        create(:course_achievement, course: course, conditions: [level_condition])
      end
      subject { Course::Conditional::ConditionalResolutionService.resolve(course_user) }

      context 'when course user satisfy the level condition' do
        it 'adds the resolved achievement conditional to the course user' do
          allow(course_user).to receive(:level_number).and_return(2)
          # TODO: Check that the achievement was added to the course user once conditional's API
          # are added in
          expect(subject).to contain_exactly(achievement)
        end
      end

      context 'when course user do not satisfy the level condition' do
        # TODO: Check that course user do not have the achievement once conditional's API are
        # added in
        it { is_expected.to be_empty }
      end
    end
  end
end
