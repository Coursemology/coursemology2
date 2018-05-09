# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::Instance::ComponentsController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    before { sign_in(admin) }

    describe '#edit' do
      subject { get :edit }
      it { is_expected.to render_template(:edit) }
    end

    describe '#update' do
      let(:ids_to_enable) do
        all_component_ids = instance.disableable_components.map { |c| c.key.to_s }
        all_component_ids.sample(1 + rand(all_component_ids.count))
      end
      let(:components_params) { { enabled_component_ids: ids_to_enable } }
      subject { patch :update, params: { settings_components: components_params } }

      context 'enable/disable components' do
        let(:settings) do
          Instance::Settings::Components.new(instance.reload)
        end

        it 'enables the component to enabled and disables all other components' do
          subject
          expect(settings.enabled_component_ids.to_set).to eq(ids_to_enable.to_set)
        end
      end

      context 'when parameters are invalid' do
        let(:components_params) do
          { enabled_component_ids: ids_to_enable << 'invalid-key' }
        end

        it 'raises an error' do
          expect { subject }.to raise_exception(ArgumentError)
        end
      end

      context 'when updated settings are invalid' do
        let(:settings_stub) do
          stub = double
          allow(stub).to receive(:valid_params?).and_return(true)
          allow(stub).to receive(:update).and_return(false)
          stub
        end

        before do
          controller.instance_variable_set(:@settings, settings_stub)
          subject
        end

        it { is_expected.to render_template(:edit) }
      end
    end
  end
end
