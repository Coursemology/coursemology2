# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::ProfilesController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:user) }

    describe '#edit' do
      subject { get :edit, as: :json }

      context 'when user is signed in' do
        before { controller_sign_in(controller, user) }

        it { is_expected.to render_template(:edit) }
      end
    end

    describe '#update' do
      let(:new_name) { 'New Name' }
      subject { patch :update, as: :json, params: { user: { name: new_name } } }

      context 'when user is signed in' do
        before { controller_sign_in(controller, user) }

        it 'changes the user name' do
          subject
          expect(user.reload.name).to eq(new_name)
        end
      end
    end
  end
end
