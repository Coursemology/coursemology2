# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::UsersController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let(:normal_user) { create(:user) }

    describe '#index' do
      subject { get :index }

      context 'when a system administrator visits the page' do
        before { sign_in(admin) }

        it { is_expected.to render_template(:index) }
      end

      context 'when an instance administrator visits the page' do
        before { sign_in(instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a normal user visits the page' do
        before { sign_in(normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update' do
      let!(:user_to_update) { create(:user) }

      subject { patch :update, as: :js, params: { id: user_to_update, user: { role: :administrator } } }

      context 'when the user is a system administrator' do
        before { sign_in(admin) }

        it 'updates the Course User' do
          expect { subject }.to change { user_to_update.reload.role }.to('administrator')
        end

        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('system.admin.users.update.success'))
        end
      end

      context 'when the user is an instance administrator' do
        before { sign_in(instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a normal user' do
        before { sign_in(normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#destroy' do
      let!(:user_to_delete) { create(:user) }
      let!(:user_stub) do
        stub = create(:user)
        allow(stub).to receive(:destroy).and_return(false)
        stub
      end

      subject { delete :destroy, id: user_to_delete }

      context 'when the user is a system administrator' do
        before { sign_in(admin) }

        it 'destroys the user' do
          subject
          expect(controller.instance_variable_get(:@user)).to be_destroyed
        end

        it { is_expected.to redirect_to(admin_users_path) }

        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('system.admin.users.destroy.success'))
        end

        context 'when the user cannot be destroyed' do
          before do
            controller.instance_variable_set(:@user, user_stub)
            subject
          end

          it { is_expected.to redirect_to(admin_users_path) }

          it 'sets an error flash message' do
            expect(flash[:danger]).to eq('')
          end
        end
      end

      context 'when the user is an instance administrator' do
        before { sign_in(instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a normal user' do
        before { sign_in(normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
