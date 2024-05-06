# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LearningMapController, type: :controller do
  let!(:instance) { create(:instance, :with_learning_map_component_enabled) }

  with_tenant(:instance) do
    let!(:course) { create(:course, :with_learning_map_component_enabled) }
    let!(:user) { create(:administrator) }
    # needed for the add_parent_node test to pass when the conditionals are evaluated
    let!(:course_staff) { create(:course_teaching_assistant, course: course, user: user) }

    before { controller_sign_in(controller, user) }

    describe '#index' do
      before do
        allow(controller).to receive_message_chain('current_component_host.[]').and_return(nil)
      end
      subject { get :index, as: :json, params: { course_id: course.id } }
      it 'raises a component not found error' do
        expect { subject }.to raise_error(ComponentNotFoundError)
      end
    end

    describe '#add_parent_node' do
      let!(:achievement1) { create(:course_achievement, course: course) }
      let!(:achievement2) { create(:course_achievement, course: course) }

      subject do
        post :add_parent_node, as: :json, params: {
          course_id: course.id, parent_node_id: "achievement-#{achievement1.id}",
          node_id: "achievement-#{achievement2.id}"
        }
      end

      it 'returns http success' do
        expect(response).to have_http_status(:success)
      end

      it 'adds the specified parent node to the specified node' do
        expect { subject }.to change { achievement2.conditions.empty? }.to(false)
      end
    end

    describe '#remove_parent_node' do
      let!(:achievement1) { create(:course_achievement, course: course) }
      let!(:achievement2) do
        create(:course_achievement, course: course).tap do |unlockable|
          create(:achievement_condition,
                 achievement: achievement1, conditional: unlockable, course: course)
        end
      end

      subject do
        post :remove_parent_node, as: :json, params: {
          course_id: course.id, parent_node_id: "achievement-#{achievement1.id}",
          node_id: "achievement-#{achievement2.id}"
        }
      end

      it 'returns http success' do
        expect(response).to have_http_status(:success)
      end

      it 'removes the specified parent node from the specified node' do
        expect { subject }.to change { achievement2.conditions.empty? }.to(true)
      end
    end

    describe '#toggle_satisfiability_type' do
      context 'initially "all conditions"' do
        let!(:achievement) do
          create(:course_achievement, course: course,
                                      satisfiability_type: :all_conditions)
        end
        subject do
          post :toggle_satisfiability_type, as: :json, params: {
            course_id: course.id, node_id: "achievement-#{achievement.id}"
          }
        end

        it 'returns http success' do
          expect(response).to have_http_status(:success)
        end

        it 'toggles the satisfiability type of a node to "at least one condition"' do
          expect { subject }.to change { achievement.reload.satisfiability_type }.to(:at_least_one_condition.to_s)
        end
      end

      context 'initially "at least one condition"' do
        let!(:achievement) do
          create(:course_achievement, course: course,
                                      satisfiability_type: :at_least_one_condition)
        end
        subject do
          post :toggle_satisfiability_type, as: :json, params: {
            course_id: course.id, node_id: "achievement-#{achievement.id}"
          }
        end

        it 'returns http success' do
          expect(response).to have_http_status(:success)
        end

        it 'toggles the satisfiability type of a node to "all conditions"' do
          expect { subject }.to change { achievement.reload.satisfiability_type }.to(:all_conditions.to_s)
        end
      end
    end
  end
end
