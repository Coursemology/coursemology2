# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::Controller, type: :controller do
  controller do
    def index
      render body: 'Success'
    end
  end

  requires_login

  let(:instance) { Instance.default }

  with_tenant(:instance) do
    it 'allows instance administrators to access the page' do
      sign_in(create(:administrator))
      get :index
      expect(response.status).to eq(200)
    end

    it 'does not allow users to access the page' do
      sign_in(create(:user))
      expect { get :index }.to raise_exception(CanCan::AccessDenied)
    end
  end
end
