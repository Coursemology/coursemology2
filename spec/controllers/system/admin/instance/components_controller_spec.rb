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
        all_component_ids = Course::ControllerComponentHost.components.map { |c| c.key.to_s }
        all_component_ids.sample(1 + rand(all_component_ids.count))
      end
      let(:components_params) { { enabled_component_ids: ids_to_enable } }
      subject { patch :update, settings_effective: components_params }

      context 'enable/disable components' do
        let(:settings) do
          Instance::Settings::Effective.new(instance.reload, Course::ControllerComponentHost)
        end

        it 'enables the component to enabled and disables all other components' do
          subject
          expect(settings.enabled_component_ids).to eq(ids_to_enable)
        end
      end

      context 'when instance cannot save' do
        before do
          allow(instance).to receive(:save).and_return(false)
          allow(controller).to receive(:current_tenant).and_return(instance)
          subject
        end

        it { is_expected.to render_template(:edit) }
      end
    end
  end
end
