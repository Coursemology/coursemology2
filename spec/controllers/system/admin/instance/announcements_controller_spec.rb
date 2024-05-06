# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::Instance::AnnouncementsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let!(:announcement_stub) do
      stub = create(:instance_announcement, instance: instance)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { controller_sign_in(controller, user) }

    describe '#index' do
      subject { get :index, as: :json }

      context 'when get request is done for json format' do
        before do
          subject
        end

        it 'returns the correct response' do
          expect(response.status).to eq(200)
        end
      end

      context 'when the user is a normal user' do
        let!(:user) { create(:user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#create' do
      subject { post :create }

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@announcement, announcement_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { id: announcement_stub } }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@announcement, announcement_stub)
          subject
        end

        it 'fails with http status bad request' do
          expect(subject).to have_http_status(:bad_request)
        end
      end
    end
  end
end
