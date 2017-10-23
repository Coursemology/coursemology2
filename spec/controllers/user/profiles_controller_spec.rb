# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::ProfilesController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:user) }

    describe '#edit' do
      subject { get :edit }

      context 'when user is signed in' do
        before { sign_in(user) }

        it { is_expected.to render_template(:edit) }
      end

      context 'when user is not signed in' do
        it { is_expected.to redirect_to(new_user_session_path) }
      end
    end

    describe '#update' do
      let(:new_name) { 'New Name' }
      subject { patch :update, params: { user: { name: new_name } } }

      context 'when user is signed in' do
        before { sign_in(user) }

        it 'changes the user name' do
          subject
          expect(user.reload.name).to eq(new_name)
        end
      end

      context 'when user is not signed in' do
        it { is_expected.to redirect_to(new_user_session_path) }
      end
    end
  end
end
