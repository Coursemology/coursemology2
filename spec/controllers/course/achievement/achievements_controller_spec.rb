# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement::AchievementsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:achievement_stub) do
      stub = create(:course_achievement, course: course)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: achievement_stub }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@achievement, achievement_stub)
          subject
        end

        it 'redirects with a flash message' do
          it { is_expected.to redirect_to(course_achievements_path(course)) }
          expect(flash[:danger]).to eq(I18n.t('course.achievement.achievements.destroy.failure',
                                              error: ''))
        end
      end
    end
  end
end
