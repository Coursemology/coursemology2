# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::Instance::UsersController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let(:normal_user) { create(:user) }

    describe '#index' do
      subject { get :index, as: :json }

      context 'when an instance administrator visits the page' do
        before { controller_sign_in(controller, instance_admin) }

        it { is_expected.to render_template(:index) }
      end

      context 'when a normal user visits the page' do
        before { controller_sign_in(controller, normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update' do
      let!(:instance_user) { create(:instance_user) }

      subject do
        patch :update, as: :json, params: { id: instance_user, instance_user: { role: :administrator } }
      end

      context 'when the user is an instance administrator' do
        before { controller_sign_in(controller, instance_admin) }

        it 'updates the Instance User' do
          expect { subject }.to change { instance_user.reload.role }.to('administrator')
        end

        it 'succeeds with http status ok' do
          expect(subject).to have_http_status(:ok)
        end
      end

      context 'when the user is a normal user' do
        before { controller_sign_in(controller, normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#destroy' do
      let!(:instance_user) { create(:instance_user) }
      let!(:instance_user_stub) do
        stub = create(:instance_user)
        allow(stub).to receive(:destroy).and_return(false)
        stub
      end

      subject { delete :destroy, params: { id: instance_user } }

      context 'when the user is an instance administrator' do
        before { controller_sign_in(controller, instance_admin) }

        it 'destroys the user' do
          subject
          expect(controller.instance_variable_get(:@instance_user)).to be_destroyed
        end

        it 'succeeds with http status ok' do
          expect(subject).to have_http_status(:ok)
        end

        context 'when the user cannot be destroyed' do
          before do
            controller.instance_variable_set(:@instance_user, instance_user_stub)
            subject
          end

          it 'fails with http status bad request' do
            expect(subject).to have_http_status(:bad_request)
          end
        end
      end

      context 'when the user is a normal user' do
        before { controller_sign_in(controller, normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
