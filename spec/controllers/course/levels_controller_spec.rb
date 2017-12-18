# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LevelsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:normal_user) { create(:user) }
    let!(:course) { create(:course) }

    describe '#create' do
      context 'when user is allowed to edit levels' do
        before { sign_in(user) }

        it 'is expected to create new levels' do
          post :create, params: { course_id: course.id, levels: [0, 100, 200, 400] }, format: :json
          saved_levels = course.reload.levels.map(&:experience_points_threshold)

          expect(saved_levels).to match_array([0, 100, 200, 400])
        end
      end

      context 'when user cannot change levels' do
        before { sign_in(normal_user) }

        it 'is expected to deny access' do
          original_levels = course.levels.map(&:experience_points_threshold)

          # Unauthorized user should be denied access.
          expect do
            post :create, params: { course_id: course.id, levels: [0, 200, 400, 800] },
                          format: :json
          end.to raise_error(CanCan::AccessDenied)

          # Levels should not be changed.
          saved_levels = course.reload.levels.map(&:experience_points_threshold)
          expect(saved_levels).to match_array(original_levels)
        end
      end
    end
  end
end
