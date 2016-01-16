require 'rails_helper'

RSpec.describe Course::Achievement::Condition::AchievementsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }

    before { sign_in(user) }

    describe '#destroy' do
      let(:other_achievement) { create(:course_achievement, course: course) }
      let(:achievement_condition) do
        create(:course_condition_achievement,
               achievement: other_achievement, course: course).tap do  |stub|
          allow(stub).to receive(:destroy).and_return(false)
        end
      end
      let(:achievement) do
        create(:course_achievement, course: course, conditions: [achievement_condition])
      end

      subject do
        delete :destroy,
               course_id: course,
               achievement_id: achievement,
               id: achievement_condition
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@achievement_condition, achievement_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it 'redirects with a flash message' do
          expect(subject).to redirect_to(edit_course_achievement_path(course, achievement))
          expect(flash[:danger]).to eq(I18n.t('course.condition.achievements.destroy.error'))
        end
      end
    end

    describe '#create' do
      let(:other_achievement) { create(:course_achievement, course: course) }
      let(:achievement_condition) do
        create(:course_condition_achievement,
               achievement: other_achievement,
               course: course).tap do |stub|
          allow(stub).to receive(:save).and_return(false)
        end
      end
      let(:achievement) do
        create(:course_achievement, course: course, conditions: [achievement_condition])
      end

      subject do
        post :create,
             course_id: course,
             achievement_id: achievement
      end

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@achievement_condition, achievement_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it 'shows the form' do
          path = new_course_achievement_condition_achievement_path(course, achievement,
                                                                   achievement_condition)
          expect(subject).to render_template('new')
        end
      end
    end
    describe '#update' do
      let(:other_achievement) { create(:course_achievement, course: course) }
      let(:achievement_condition) do
        create(:course_condition_achievement,
               achievement: other_achievement,
               course: course).tap do |stub|
          allow(stub).to receive(:update_attributes).and_return(false)
        end
      end
      let(:achievement) do
        create(:course_achievement, course: course, conditions: [achievement_condition])
      end

      subject do
        patch :update,
              course_id: course,
              achievement_id: achievement,
              id: achievement_condition,
              condition_achievement: { achievement_id: achievement.id }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@achievement_condition, achievement_condition)
          controller.instance_variable_set(:@conditional, achievement)
          subject
        end

        it 'shows the form' do
          path = edit_course_achievement_condition_achievement_path(course, achievement,
                                                                    achievement_condition)
          expect(subject).to render_template('edit')
        end
      end
    end
  end
end
