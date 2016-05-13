# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement::AchievementsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }

    before { sign_in(user) }

    describe '#index' do
      before do
        allow(controller).to receive_message_chain('current_component_host.[]').and_return(nil)
      end
      subject { get :index, course_id: course }
      it 'raises an component not found error' do
        expect { subject }.to raise_error(ComponentNotFoundError)
      end
    end

    describe '#update' do
      subject do
        patch :update, course_id: course, id: achievement_stub,
                       achievement: { course_user_ids: [course_user.id] }
      end

      context 'when the achievement is automatically awarded' do
        let!(:course_user) { create(:course_user, :approved, course: course) }
        let!(:achievement_stub) do
          stub = create(:course_achievement, course: course)
          allow(stub).to receive(:manually_awarded?).and_return(false)
          stub
        end
        before do
          controller.instance_variable_set(:@achievement, achievement_stub)
        end

        it 'raises an error' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end

    describe '#destroy' do
      let!(:achievement_stub) do
        stub = create(:course_achievement, course: course)
        allow(stub).to receive(:destroy).and_return(false)
        stub
      end
      subject { delete :destroy, course_id: course, id: achievement_stub }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@achievement, achievement_stub)
          subject
        end

        it { is_expected.to redirect_to(course_achievements_path(course)) }
        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.achievement.achievements.destroy.failure',
                                              error: ''))
        end
      end
    end
  end
end
