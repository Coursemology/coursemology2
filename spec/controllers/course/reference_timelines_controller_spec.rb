# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ReferenceTimelinesController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable, :with_multiple_reference_timelines_component_enabled) }
    let(:title) { 'Test Timeline' }
    let(:alternative_title) { 'Alternative Timeline' }
    let(:new_weight) { 6 }
    let!(:timeline) { create(:course_reference_timeline, course: course) }

    before { controller_sign_in(controller, user) }

    describe '#index' do
      subject { get :index, as: :json, params: { course_id: course } }

      context 'when the user is a manager of the course' do
        let(:user) { create(:course_manager, course: course).user }

        it { is_expected.to render_template(:index) }
      end

      context 'when the user is a student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end
    end

    describe '#create' do
      subject do
        post :create, as: :json, params: {
          course_id: course,
          reference_timeline: { title: title }
        }
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'creates the timeline with the given title' do
          expect { subject }.to change { course.reference_timelines.size }.by(1)
          is_expected.to have_http_status(:ok)
          is_expected.to render_template(partial: '_reference_timeline')

          new_timeline = assigns(:reference_timeline)
          expect(new_timeline.title).to eq(title)
          expect(new_timeline.weight).to eq(2)
        end

        context 'when cannot be saved' do
          before do
            allow(timeline).to receive(:save).and_return(false)
            controller.instance_variable_set(:@reference_timeline, timeline)
          end

          it 'fails and responds bad request with errors' do
            expect(subject).to have_http_status(:bad_request)
            expect(JSON.parse(response.body)['errors']).not_to be_nil
          end
        end
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Observer' do
        let(:user) { create(:course_observer, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update' do
      subject do
        patch :update, as: :json, params: {
          course_id: course,
          id: timeline,
          reference_timeline: { title: alternative_title, weight: new_weight }
        }
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'can change the title' do
          is_expected.to have_http_status(:ok)

          updated_timeline = assigns(:reference_timeline)
          expect(updated_timeline.title).to eq(alternative_title)
          expect(updated_timeline.weight).to eq(new_weight)
        end

        context 'when cannot be saved' do
          before do
            allow(timeline).to receive(:save).and_return(false)
            controller.instance_variable_set(:@reference_timeline, timeline)
          end

          it 'fails and responds bad request with errors' do
            expect(subject).to have_http_status(:bad_request)
            expect(JSON.parse(response.body)['errors']).not_to be_nil
          end
        end
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Observer' do
        let(:user) { create(:course_observer, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#destroy' do
      subject do
        delete :destroy, as: :json, params: {
          course_id: course,
          id: timeline
        }
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'is destroyed' do
          expect { subject }.to change { course.reference_timelines.size }.by(-1)
          is_expected.to have_http_status(:ok)
          expect { timeline.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end

        context 'when is assigned to some course users' do
          let!(:student) { create(:course_student, course: course, reference_timeline: timeline) }

          it 'cannot be destroyed' do
            expect { subject }.not_to(change { course.reference_timelines.size })
            is_expected.to have_http_status(:bad_request)
          end

          context 'when given an alternative timeline to revert to' do
            let!(:alternative_timeline) { create(:course_reference_timeline, course: course) }

            subject do
              delete :destroy, as: :json, params: {
                course_id: course,
                id: timeline,
                revert_to: alternative_timeline.id
              }
            end

            it 'is destroyed and reverts the course users to the alternative timeline' do
              course_users = timeline.course_users

              expect { subject }.to change { course.reference_timelines.size }.by(-1)
              is_expected.to have_http_status(:ok)
              expect { timeline.reload }.to raise_error(ActiveRecord::RecordNotFound)

              course_users.each do |course_user|
                expect(course_user.reference_timeline).to eq(alternative_timeline)
              end
            end
          end

          context "when given 'default' as an alternative timeline to revert to" do
            subject do
              delete :destroy, as: :json, params: {
                course_id: course,
                id: timeline,
                revert_to: 'default'
              }
            end

            it 'is destroyed and reverts the course users to the default timeline' do
              course_users = timeline.course_users

              expect { subject }.to change { course.reference_timelines.size }.by(-1)
              is_expected.to have_http_status(:ok)
              expect { timeline.reload }.to raise_error(ActiveRecord::RecordNotFound)

              course_users.each do |course_user|
                expect(course_user.reference_timeline).to eq(course.default_reference_timeline)
              end
            end
          end
        end

        context 'when the timeline cannot be destroyed' do
          before do
            allow(timeline).to receive(:destroy).and_return(false)
            controller.instance_variable_set(:@reference_timeline, timeline)
          end

          it 'fails and responds bad request with errors' do
            expect { subject }.not_to(change { course.reference_timelines.size })
            expect(subject).to have_http_status(:bad_request)
            expect(JSON.parse(response.body)['errors']).not_to be_nil
          end
        end

        context 'when cannot be destroyed' do
          before do
            allow(timeline).to receive(:destroy).and_return(false)
            controller.instance_variable_set(:@reference_timeline, timeline)
          end

          it 'fails and responds bad request with errors' do
            expect(subject).to have_http_status(:bad_request)
            expect(JSON.parse(response.body)['errors']).not_to be_nil
          end
        end
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Observer' do
        let(:user) { create(:course_observer, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
