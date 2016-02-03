# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement::Condition::LevelsController, type: :controller do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }

    before { sign_in(user) }

    describe '#destroy' do
      let(:level_condition) do
        create(:course_condition_level, course: course).tap do |stub|
          allow(stub).to receive(:destroy).and_return(false)
        end
      end
      let(:achievement) do
        create(:course_achievement,
               course: course,
               conditions: [level_condition])
      end

      subject do
        delete :destroy,
               course_id: course,
               achievement_id: achievement,
               id: level_condition
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@level_condition, level_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it 'redirects with a flash message' do
          expect(subject).to redirect_to(edit_course_achievement_path(course, achievement))
          expect(flash[:danger]).to eq(I18n.t('course.condition.levels.destroy.error'))
        end
      end
    end

    describe '#create' do
      let(:level_condition) do
        create(:course_condition_level, course: course).tap do |stub|
          allow(stub).to receive(:save).and_return(false)
        end
      end
      let!(:achievement) do
        create(:course_achievement,
               course: course,
               conditions: [level_condition])
      end

      subject do
        post :create,
             course_id: course,
             achievement_id: achievement
      end

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@level_condition, level_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it 'shows the form' do
          expect(subject).to render_template('new')
        end
      end
    end

    describe '#update' do
      let(:min_level) { 7 }
      let(:level_condition) do
        create(:course_condition_level, course: course, minimum_level: min_level).tap do |stub|
          allow(stub).to receive(:update_attributes).and_return(false)
        end
      end
      let!(:achievement) do
        create(:course_achievement,
               course: course,
               conditions: [level_condition])
      end

      subject do
        patch :update,
              course_id: course,
              achievement_id: achievement,
              id: level_condition,
              condition_level: { minimum_level: min_level }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@level_condition, level_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it 'shows the form' do
          expect(subject).to render_template('edit')
        end
      end
    end
  end
end
