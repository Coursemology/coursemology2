# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Event do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:survey) { create(:survey, course: course) }

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      it { is_expected.to be_able_to(:manage, survey) }

      it 'allows the user to see all surveys' do
        expect(course.surveys.accessible_by(subject)).
          to contain_exactly(survey)
      end
    end

    context 'when the user is a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      it { is_expected.to be_able_to(:show, survey) }
      it { is_expected.not_to be_able_to(:manage, survey) }

      it 'allows the user to see all surveys' do
        expect(course.surveys.accessible_by(subject)).
          to contain_exactly(survey)
      end
    end
  end
end
