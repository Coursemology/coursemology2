# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement::Condition::LevelsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }

    before { sign_in(user) }

    describe '#destroy' do
      let(:level_condition) do
        create(:course_condition_level, course: course, conditional: achievement).tap do |stub|
          allow(stub).to receive(:destroy).and_return(false)
        end
      end
      let(:achievement) { create(:course_achievement, course: course) }

      subject do
        delete :destroy, params: {
          course_id: course,
          achievement_id: achievement,
          id: level_condition
        }
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@level_condition, level_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#create' do
      let(:level_condition) do
        create(:course_condition_level, course: course, conditional: achievement).tap do |stub|
          allow(stub).to receive(:save).and_return(false)
        end
      end
      let!(:achievement) { create(:course_achievement, course: course) }

      subject do
        post :create, params: { course_id: course, achievement_id: achievement }
      end

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@level_condition, level_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#update' do
      let(:min_level) { 7 }
      let(:level_condition) do
        create(:course_condition_level, course: course, minimum_level: min_level,
                                        conditional: achievement).tap do |stub|
          allow(stub).to receive(:update).and_return(false)
        end
      end
      let!(:achievement) { create(:course_achievement, course: course) }

      subject do
        patch :update, params: {
          course_id: course,
          achievement_id: achievement,
          id: level_condition,
          condition_level: { minimum_level: min_level }
        }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@level_condition, level_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end
  end
end
