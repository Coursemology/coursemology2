# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::InstancesController do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    before { sign_in(admin) }

    describe '#destroy' do
      let!(:instance_to_delete) { create(:instance) }
      let!(:instance_stub) do
        stub = build_stubbed(:instance)
        allow(stub).to receive(:destroy).and_return(false)
        stub
      end

      subject { delete :destroy, params: { id: instance_to_delete } }

      it { is_expected.to redirect_to(admin_instances_path) }

      it 'sets an success flash message' do
        subject
        expect(flash[:success]).to eq(I18n.t('system.admin.instances.destroy.success'))
      end

      context 'when the instance cannot be destroyed' do
        before do
          controller.instance_variable_set(:@instance, instance_stub)
          subject
        end

        it { is_expected.to redirect_to(admin_instances_path) }

        it 'sets an error flash message' do
          expect(flash[:danger]).to eq(I18n.t('system.admin.instances.destroy.failure'))
        end
      end
    end
  end
end
