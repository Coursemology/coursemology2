# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::AnnouncementsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let!(:system_announcement_stub) do
      stub = create(:system_announcement)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject { delete :destroy, params: { id: system_announcement_stub } }

      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@announcement, system_announcement_stub)
          subject
        end

        it 'fails with http status bad request' do
          expect(subject).to have_http_status(:bad_request)
        end
      end
    end
  end
end
