# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::Instance::UsersController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let(:normal_user) { create(:user) }

    describe '#index' do
      subject { get :index }

      context 'when an instance administrator visits the page' do
        before { sign_in(instance_admin) }

        it { is_expected.to render_template(:index) }
      end

      context 'when a normal user visits the page' do
        before { sign_in(normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update' do
      let!(:instance_user) { create(:instance_user) }

      subject do
        patch :update, format: :js, id: instance_user, instance_user: { role: :administrator }
      end

      context 'when the user is an instance administrator' do
        before { sign_in(instance_admin) }

        it 'updates the Instance User' do
          expect { subject }.to change { instance_user.reload.role }.to('administrator')
        end

        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('system.admin.instance.users.update.success'))
        end
      end

      context 'when the user is a normal user' do
        before { sign_in(normal_user) }

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
        before { sign_in(instance_admin) }

        it 'destroys the user' do
          subject
          expect(controller.instance_variable_get(:@instance_user)).to be_destroyed
        end

        it { is_expected.to redirect_to(admin_instance_users_path) }

        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('system.admin.instance.users.destroy.success'))
        end

        context 'when the user cannot be destroyed' do
          before do
            controller.instance_variable_set(:@instance_user, instance_user_stub)
            subject
          end

          it { is_expected.to redirect_to(admin_instance_users_path) }

          it 'sets an error flash message' do
            expect(flash[:danger]).to eq('')
          end
        end
      end

      context 'when the user is a normal user' do
        before { sign_in(normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
