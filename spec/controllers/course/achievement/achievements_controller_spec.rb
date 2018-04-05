# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Achievement::AchievementsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }

    before { sign_in(user) }

    describe '#index' do
      before do
        allow(controller).to receive_message_chain('current_component_host.[]').and_return(nil)
      end
      subject { get :index, params: { course_id: course } }
      it 'raises an component not found error' do
        expect { subject }.to raise_error(ComponentNotFoundError)
      end
    end

    describe '#update' do
      context 'when the achievement is automatically awarded' do
        subject do
          patch :update, params: {
            course_id: course, id: achievement_stub,
            achievement: { course_user_ids: [course_user.id] }
          }
        end

        let!(:course_user) { create(:course_student, course: course) }
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
      subject { delete :destroy, params: { course_id: course, id: achievement_stub } }

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

    describe '#reorder' do
      let!(:achievements) { create_list(:course_achievement, 3, course: course) }

      context 'when a valid ordering is given' do
        let(:reversed_order) { course.achievements.map(&:id).reverse }

        before do
          post :reorder, format: :js, params: { course_id: course, achievement_order: reversed_order.map(&:to_s) }
        end

        it 'reorders achievements' do
          expect(course.reload.achievements.pluck(:id)).to eq(reversed_order)
        end
      end

      context 'when an invalid ordering is given' do
        subject do
          post :reorder, format: :js, params: { course_id: course, achievement_order: [achievements.first.id.to_s] }
        end

        it 'raises ArgumentError' do
          expect { subject }.
            to raise_error(ArgumentError, 'Invalid ordering for achievements')
        end
      end
    end

    describe '#achievement_params' do
      describe '#badge attribute within the param' do
        let!(:achievement) { create(:achievement, :with_badge, course: course) }
        before do
          patch :update, params: {
            course_id: course, id: achievement,
            achievement: { badge: badge_attribute }
          }
        end
        subject { controller.send(:achievement_params)[:badge] }

        context 'when the badge field is not an uploaded file' do
          let(:badge_attribute) { 'null' }

          it { is_expected.to be_nil }
        end

        context 'when the badge field is an uploaded file' do
          let(:badge_attribute) do
            Rack::Test::UploadedFile.new(
              Rails.root.join('spec', 'fixtures', 'files', 'picture.jpg'), 'image/jpeg'
            )
          end

          it { is_expected.not_to be_nil }
        end
      end
    end
  end
end
