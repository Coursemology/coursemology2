# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::ItemsController, type: :controller do
  let(:instance_traits) { nil }
  let!(:instance) { create(:instance, *instance_traits) }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:course_traits) { nil }
    let(:course) { create(:course, *course_traits, creator: admin) }
    let(:student) { create(:course_student, course: course) }

    before { sign_in(user) }

    describe '#index' do
      subject { get :index, params: { course_id: course.id } }

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

        subject { get :index, params: { format: :json, course_id: course.id } }

        context 'when user is staff' do
          let(:user) { admin }

          it 'responds with all items' do
            subject

            expect(json_response.keys).to contain_exactly('milestones', 'items', 'flags',
                                                          'visibilitySettings')
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
            let!(:video) { create(:video, course: course) }
            let(:instance_traits) { :with_video_component_enabled }
            let(:course_traits) { :with_video_component_enabled }

            it 'responds with the list of videos' do
              subject

              expect(json_response['items'].map { |i| i['lesson_plan_item_type'][0] }).
                to include(I18n.t('components.video.name'))
            end
          end

          context 'when the course has assessments' do
            let!(:assessment) { create(:course_assessment_assessment, course: course) }
            let(:tab) { assessment.tab }

            context 'when the assessment tab is enabled for display' do
              it 'responds including the assessment data' do
                subject

                # 2 lesson plan events and the assessment item
                expect(json_response['items'].length).to eq(3)

                puts json_response['items']
                assessment_item_data = json_response['items'].last
                expect(assessment_item_data['title']).to eq(assessment.title)
              end
            end

            context 'when the assessment tab is disabled for display' do
              before do
                course.settings(:course_assessments_component, :lesson_plan_items, "tab_#{tab.id}").enabled = false
                course.save!
              end

              it 'responds without the assessment data' do
                subject

                # Just the 2 lesson plan events
                expect(json_response['items'].length).to eq(2)
              end
            end
          end

          context 'when the video component is disabled on the course' do
            let(:instance_traits) { :with_video_component_enabled }
            let!(:video) { create(:video, course: course) }

            it 'responds with the list of items, excluding videos' do
              subject

              expect(json_response['items']).not_to be_empty
              expect(json_response['items'].map { |i| i['lesson_plan_item_type'][0] }).
                not_to include(I18n.t('components.video.name'))
            end
          end

          context 'when the video component is disabled on the instance' do
            let!(:video) { create(:video, course: course) }

            it 'responds with the list of items, excluding videos' do
              subject

              expect(json_response['items']).not_to be_empty
              expect(json_response['items'].map { |i| i['lesson_plan_item_type'][0] }).
                not_to include(I18n.t('components.video.name'))
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
