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

        context 'when user is staff' do
          let(:user) { admin }

          it 'responds with all items' do
            subject

            expect(json_response.keys).to contain_exactly('milestones', 'items', 'flags')
            expect(json_response['items'].length).to eq(2)

            milestone_data = json_response['milestones'][0]
            item_data = json_response['items'][0]
            expect(milestone_data.keys).to contain_exactly(
              'id', 'title', 'description', 'start_at'
            )
            expect(item_data.keys).to contain_exactly(
              'id', 'title', 'description', 'published', 'location', 'lesson_plan_item_type',
              'start_at', 'bonus_end_at', 'end_at', 'eventId'
            )
            expect(json_response['flags']['canManageLessonPlan']).to be(true)
          end

          context 'when the video component is enabled' do
            before do
              instance.settings(:components, :course_videos_component).enabled = true
              instance.save!
              course.settings(:components, :course_videos_component).enabled = true
              course.save!
            end
            let!(:milestone) { create(:course_lesson_plan_milestone, course: course) }
            let!(:video) { create(:video, course: course) }

            it 'responds with the list of videos' do
              subject

              expect(json_response['items'].map { |i| i['lesson_plan_item_type'][0] }).
                to include(I18n.t('components.video.name'))
            end
          end
        end

        context 'when user is student' do
          let(:user) { student.user }

          it 'responds with published items only' do
            subject

            expect(json_response['items'].length).to eq(1)

            milestone_data = json_response['milestones'][0]
            item_data = json_response['items'][0]
            expect(milestone_data.keys).to contain_exactly(
              'id', 'title', 'description', 'start_at'
            )
            expect(item_data.keys).to contain_exactly(
              'id', 'title', 'description', 'published', 'location', 'lesson_plan_item_type',
              'start_at', 'bonus_end_at', 'end_at', 'eventId'
            )
            expect(json_response['flags']['canManageLessonPlan']).to be(false)
          end
        end
      end
    end
  end
end
