# frozen_string_literal: true
require 'rails_helper'

RSpec.describe HealthCheckController, type: :controller do
  context 'when the server is up' do
    it 'returns the correct header' do
      get :show

      expect(response).to have_http_status(:success)
    end
  end

  context 'when there is an exception' do
    before do
      allow_any_instance_of(HealthCheckController).
        to receive(:show).
        and_raise(Exception)
    end

    it 'returns the correct header' do
      expect do
        get :show
        expect(response).to have_http_status(:service_unavailable)
      end.to raise_error(Exception)
    end
  end
end
