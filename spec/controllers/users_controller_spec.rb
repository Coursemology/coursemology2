# frozen_string_literal: true
require 'rails_helper'

RSpec.describe UsersController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    render_views

    let!(:user) { create(:user) }

    describe '#show' do
      before { controller_sign_in(controller, user) }
      subject { get :show, as: :json, params: { id: user_id } }

      context 'When user is system user' do
        let(:user_id) { User::SYSTEM_USER_ID }
        it 'returns the 404 page' do
          subject

          expect(response.status).to eq(404)
        end
      end

      context 'When user is deleted user' do
        let(:user_id) { User::DELETED_USER_ID }
        it 'returns the 404 page' do
          subject

          expect(response.status).to eq(404)
        end
      end

      context 'when viewing a normal user profile' do
        let(:user_id) { user.id }

        context 'when the user is an instructor on the current instance' do
          before { user.instance_users.find_by(instance: instance).update!(role: :instructor) }

          it 'returns instructor as the instanceRole in the user JSON' do
            subject
            json = JSON.parse(response.body, symbolize_names: true)
            expect(json[:user][:instanceRole]).to eq('instructor')
          end
        end

        context 'when the user is a normal user on the current instance' do
          it 'returns normal as the instanceRole in the user JSON' do
            subject
            json = JSON.parse(response.body, symbolize_names: true)
            expect(json[:user][:instanceRole]).to eq('normal')
          end
        end

        context 'when the user is an administrator on the current instance' do
          before { user.instance_users.find_by(instance: instance).update!(role: :administrator) }

          it 'returns administrator as the instanceRole in the user JSON' do
            subject
            json = JSON.parse(response.body, symbolize_names: true)
            expect(json[:user][:instanceRole]).to eq('administrator')
          end
        end

        context 'when the user has no instance_user record' do
          before { user.instance_users.where(instance: instance).destroy_all }

          it 'returns nil as the instanceRole in the user JSON' do
            subject
            json = JSON.parse(response.body, symbolize_names: true)
            expect(json[:user][:instanceRole]).to be_nil
          end
        end
      end
    end
  end
end
