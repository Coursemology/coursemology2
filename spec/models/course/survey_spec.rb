# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey, type: :model do
  it { is_expected.to act_as(Course::LessonPlan::Item) }
  it { is_expected.to have_many(:questions).through(:sections) }
  it { is_expected.to have_many(:responses).inverse_of(:survey).dependent(:destroy) }
  it { is_expected.to have_many(:sections).inverse_of(:survey).dependent(:destroy) }

  let(:instance) { Instance.default }
  let(:course) { create(:course) }
  let(:user) { create(:course_student, course: course).user }
  let(:survey) { create(:course_survey, *survey_traits) }
  with_tenant(:instance) do
    describe '#can_user_start' do
      subject { survey.can_user_start?(user) }

      context 'when survey has no end time' do
        let(:survey) { build(:survey, end_at: nil, course: course) }
        it { is_expected.to be true }
      end

      context 'when survey allows response after end' do
        let(:survey) { build(:survey, :allow_response_after_end, course: course) }
        it { is_expected.to be true }
      end

      context 'when survey is active' do
        let(:survey) { build(:survey, :currently_active) }
        it { is_expected.to be true }
      end

      context 'when survey is expired' do
        let(:survey) { build(:survey, :expired) }
        it { is_expected.to be false }
      end
    end

    describe '#satisfiable?' do
      context 'when survey is published' do
        let(:survey_traits) { :published }

        it 'is satisfiable' do
          expect(survey.satisfiable?).to be_truthy
        end
      end

      context 'when survey is not published' do
        let(:survey_traits) { nil }

        it 'is satisfiable' do
          expect(survey.satisfiable?).to be_falsy
        end
      end
    end
  end
end
