# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::MarketplaceAccessBlocksController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    before do
      Course::Assessment::Marketplace::AccessBlock.delete_all
      controller_sign_in(controller, admin)
    end

    describe 'POST #create' do
      it 'blocks the user and returns the block id' do
        target = create(:user)
        expect do
          post :create, format: :json, params: { user_id: target.id }
        end.to change { Course::Assessment::Marketplace::AccessBlock.count }.by(1)
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['userId']).to eq(target.id)
        expect(response.parsed_body['id']).to be_present
      end

      it 'rejects a duplicate block for the same user' do
        target = create(:user)
        create(:course_assessment_marketplace_access_block, user: target)
        expect do
          post :create, format: :json, params: { user_id: target.id }
        end.not_to(change { Course::Assessment::Marketplace::AccessBlock.count })
        expect(response).to have_http_status(:bad_request)
      end
    end

    describe 'DELETE #destroy' do
      it 'removes the block' do
        block = create(:course_assessment_marketplace_access_block)
        expect do
          delete :destroy, format: :json, params: { id: block.id }
        end.to change { Course::Assessment::Marketplace::AccessBlock.count }.by(-1)
        expect(response).to have_http_status(:ok)
      end
    end

    describe 'authorization' do
      run_rescue

      it 'forbids a non-administrator' do
        controller_sign_in(controller, create(:user))
        post :create, format: :json, params: { user_id: create(:user).id }
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
