# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AnnouncementsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }
    let!(:announcement_stub) do
      stub = create(:course_announcement, course: course)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { controller_sign_in(controller, user) }

    describe '#index' do
      context 'when announcements component is disabled' do
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

    describe '#create' do
      subject { post :create, params: { course_id: course } }

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@announcement, announcement_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: announcement_stub } }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@announcement, announcement_stub)
          subject
        end

        it 'returns an error' do
          expect(response.status).to eq(400)
        end
      end
    end
  end
end
