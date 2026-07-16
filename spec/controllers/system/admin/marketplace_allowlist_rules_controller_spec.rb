# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::MarketplaceAllowlistRulesController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    before { controller_sign_in(controller, admin) }

    describe 'POST #create' do
      subject do
        post :create, format: :json, params: {
          allowlist_rule: { rule_type: 'email_domain', email_domain: 'schools.gov.sg' }
        }
      end

      it 'creates an email-domain rule' do
        expect { subject }.
          to change { Course::Assessment::Marketplace::AllowlistRule.count }.by(1)
        expect(response).to have_http_status(:ok)
      end
    end

    describe 'GET #index' do
      render_views
      # This suite runs with `use_transactional_fixtures = false` and no DatabaseCleaner, so rows
      # created by earlier local runs of this factory persist in the dev/test DB; scope to a clean
      # slate here so the size assertion below is deterministic.
      before do
        Course::Assessment::Marketplace::AllowlistRule.delete_all
        create(:course_assessment_marketplace_allowlist_rule, :for_email_domain)
      end

      it 'lists the rules' do
        get :index, format: :json
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['rules'].size).to eq(1)
      end
    end

    describe 'DELETE #destroy' do
      let!(:rule) { create(:course_assessment_marketplace_allowlist_rule, :for_email_domain) }

      it 'removes the rule' do
        expect { delete :destroy, format: :json, params: { id: rule.id } }.
          to change { Course::Assessment::Marketplace::AllowlistRule.count }.by(-1)
        expect(response).to have_http_status(:ok)
      end
    end

    describe 'authorization' do
      run_rescue

      it 'forbids a non-administrator' do
        controller_sign_in(controller, create(:user))
        get :index, format: :json
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
