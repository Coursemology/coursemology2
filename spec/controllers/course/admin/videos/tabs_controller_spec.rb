# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::Videos::TabsController, type: :controller do
  let!(:instance) { create(:instance, :with_video_component_enabled) }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let!(:course) { create(:course, :with_video_component_enabled, creator: user) }
    let!(:tab_stub) do
      stub = create(:course_video_tab)
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub).to receive(:save).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#create' do
      subject { post :create, params: { course_id: course } }
      context 'upon create failure' do
        before do
          controller.instance_variable_set(:@tab, tab_stub)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: tab_stub } }
      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@tab, tab_stub)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end
  end
end
