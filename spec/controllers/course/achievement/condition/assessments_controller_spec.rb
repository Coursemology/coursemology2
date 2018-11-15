# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement::Condition::AssessmentsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }

    before { sign_in(user) }

    describe '#destroy' do
      let(:assessment_condition) do
        create(:course_condition_assessment, course: course, conditional: achievement).tap do |stub|
          allow(stub).to receive(:destroy).and_return(false)
        end
      end
      let(:achievement) { create(:course_achievement, course: course) }

      subject do
        delete :destroy, params: {
          course_id: course,
          achievement_id: achievement,
          id: assessment_condition
        }
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@assessment_condition, assessment_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it { is_expected.to redirect_to(edit_course_achievement_path(course, achievement)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.condition.assessments.destroy.error'))
        end
      end
    end

    describe '#create' do
      let(:assessment_condition) do
        create(:course_condition_assessment, course: course, conditional: achievement).tap do |stub|
          allow(stub).to receive(:save).and_return(false)
        end
      end
      let(:achievement) { create(:course_achievement, course: course) }

      subject do
        post :create, params: { course_id: course, achievement_id: achievement }
      end

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@assessment_condition, assessment_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it { is_expected.to render_template(:new) }
      end
    end

    describe '#update' do
      let(:assessment) { create(:assessment) }
      let(:minimum_grade_percentage) { 50.0 }
      let(:assessment_condition) do
        create(:course_condition_assessment, course: course, assessment: assessment,
                                             conditional: achievement).tap do |stub|
          allow(stub).to receive(:update_attributes).and_return(false)
        end
      end
      let(:achievement) { create(:course_achievement, course: course) }

      subject do
        patch :update, params: {
          course_id: course,
          achievement_id: achievement,
          id: assessment_condition,
          condition_assessment: { minimum_grade_percentage: minimum_grade_percentage }
        }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@assessment_condition, assessment_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it { is_expected.to render_template(:edit) }
      end
    end
  end
end
