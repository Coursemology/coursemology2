# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::ItemsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:course) { create(:course, creator: admin) }
    let(:student) { create(:course_student, course: course) }

    before { sign_in(user) }

    describe '#index' do
      subject { get :index, course_id: course.id }

      context 'when survey component is disabled' do
        let(:user) { admin }
        before do
          allow(controller).
            to receive_message_chain('current_component_host.[]').and_return(nil)
        end

        it 'raises an component not found error' do
          expect { subject }.to raise_error(ComponentNotFoundError)
        end
      end

      context 'when json data is requested' do
        render_views
        let(:json_response) { JSON.parse(response.body) }
        let!(:milestone) { create(:course_lesson_plan_milestone, course: course) }
        let!(:item) { create(:course_lesson_plan_event, course: course) }
        let!(:published_item) do
          create(:course_lesson_plan_event, published: true, course: course)
        end

        subject { get :index, format: :json, course_id: course.id }
        before { subject }

        context 'when user is staff' do
          let(:user) { admin }

          it 'responds with all items' do
            expect(json_response.keys).to contain_exactly('milestones', 'items')
            expect(json_response['items'].length).to eq(2)

            milestone_data = json_response['milestones'][0]
            item_data = json_response['items'][0]
            expect(milestone_data.keys).to contain_exactly(
              'id', 'title', 'description', 'start_at', 'edit_path', 'delete_path'
            )
            expect(item_data.keys).to contain_exactly(
              'id', 'title', 'description', 'published', 'location', 'lesson_plan_item_type',
              'start_at', 'bonus_end_at', 'end_at', 'edit_path', 'delete_path'
            )
          end
        end
        context 'when user is student' do
          let(:user) { student.user }

          it 'responds with published items only' do
            expect(json_response['items'].length).to eq(1)

            milestone_data = json_response['milestones'][0]
            item_data = json_response['items'][0]
            expect(milestone_data.keys).to contain_exactly(
              'id', 'title', 'description', 'start_at'
            )
            expect(item_data.keys).to contain_exactly(
              'id', 'title', 'description', 'published', 'location', 'lesson_plan_item_type',
              'start_at', 'bonus_end_at', 'end_at'
            )
          end
        end
      end
    end
  end
end
