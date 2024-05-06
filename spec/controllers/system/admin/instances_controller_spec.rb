# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::InstancesController do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    before { controller_sign_in(controller, admin) }

    describe '#destroy' do
      let!(:instance_to_delete) { create(:instance) }
      let!(:instance_stub) do
        stub = build_stubbed(:instance)
        allow(stub).to receive(:destroy).and_return(false)
        stub
      end

      subject { delete :destroy, params: { id: instance_to_delete } }

      it 'succeeds with http status ok' do
        expect(subject).to have_http_status(:ok)
      end

      context 'when the instance cannot be destroyed' do
        before do
          controller.instance_variable_set(:@instance, instance_stub)
          subject
        end

        it 'fails with http status bad request' do
          expect(subject).to have_http_status(:bad_request)
        end
      end
    end
  end
end
