# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::GetHelpController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:instance_admin) { create(:instance_user, role: :administrator).user }
    let(:normal_user) { create(:user) }

    describe '#index' do
      subject { get :index, params: params, as: :json }
      let(:params) { {} }

      context 'when a system administrator visits the page' do
        before { controller_sign_in(controller, admin) }

        context 'with valid date range' do
          it 'renders the index template' do
            expect(subject).to render_template(:index)
            expect(response).to have_http_status(:ok)
          end
        end

        context 'with invalid date range' do
          let(:params) { { start_at: '2025-12-31', end_at: '2025-01-01' } }
          it 'returns a 400 error' do
            subject
            expect(response).to have_http_status(:bad_request)
            expect(JSON.parse(response.body)['error']).to eq('Invalid date range')
          end
        end
      end

      context 'when an instance administrator visits the page' do
        before { controller_sign_in(controller, instance_admin) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a normal user visits the page' do
        before { controller_sign_in(controller, normal_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
