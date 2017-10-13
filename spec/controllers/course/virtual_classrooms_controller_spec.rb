# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::VirtualClassroomsController, type: :controller do
  let!(:instance) { create(:instance, :with_virtual_classroom_component_enabled) }

  with_tenant(:instance) do
    let!(:course) { create(:course, :with_virtual_classroom_component_enabled) }
    let!(:virtual_classroom_stub) do
      stub = create(:course_virtual_classroom, course: course)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    context 'When the user is a student' do
      let(:user) { create(:course_student, course: course).user }

      describe '#index' do
        context 'when virtual classrooms component is disabled' do
          before do
            allow(controller).
              to receive_message_chain('current_component_host.[]').and_return(nil)
          end
          subject { get :index, params: { course_id: course } }
          it 'raises an component not found error' do
            expect { subject }.to raise_error(ComponentNotFoundError)
          end
        end
      end

      describe '#recorded_video_link' do
        subject { get :recorded_video_link, params: { course_id: course, record_id: 123 }, as: :json }

        context 'student should not be able to access' do
          before do
            controller.instance_variable_set(:@course, course)
          end

          it { expect { subject }.to raise_error(CanCan::AccessDenied) }
        end
      end
    end

    context 'When the user is an admin' do
      let(:user) { create(:course_manager, course: course).user }

      describe '#recorded_video_link' do
        subject { get :recorded_video_link, params: { course_id: course, record_id: 123, format: :json } }

        context 'admin should be able to access' do
          before do
            controller.instance_variable_set(:@course, course)
            subject
          end

          it { expect(response.status).to eq(200) }
        end
      end

      describe '#destroy' do
        subject { delete :destroy, params: { course_id: course, id: virtual_classroom_stub } }

        context 'upon destroy failure' do
          before do
            controller.instance_variable_set(:@virtual_classroom, virtual_classroom_stub)
            subject
          end

          it { is_expected.to redirect_to(course_virtual_classrooms_path(course)) }
          it 'sets an error flash message' do
            expect(flash[:danger]).to eq(I18n.t('course.virtual_classrooms.destroy.failure',
                                                error: ''))
          end
        end
      end
    end
  end
end
