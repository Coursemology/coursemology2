# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::AchievementPreloadService, type: :service do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:assessments) { create_list(:assessment, 2, course: course) }
    let!(:assessment_condition) do
      create(:course_condition_assessment, :achievement_conditional,
             course: course, assessment: assessments[0])
    end

    describe '#achievement_condition_for' do
      subject do
        service = Course::Assessment::AchievementPreloadService.new(assessments)
        service.achievement_conditional_for(assessment)
      end

      context 'when the assessment is a condition for an achievement conditional' do
        let(:assessment) { assessments[0] }
        let(:achievement) { assessment_condition.conditional }

        it 'returns the achievement' do
          expect(subject).to contain_exactly(achievement)
        end
      end

      context 'when the assessment is not a condition for any achievements' do
        let(:assessment) { assessments[1] }

        it 'returns an empty array' do
          expect(subject).to be_empty
        end
      end
    end
  end
end
