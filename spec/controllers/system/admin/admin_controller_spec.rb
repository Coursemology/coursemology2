require 'rails_helper'

RSpec.describe System::Admin::AdminController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    before { sign_in(admin) }

    describe '#components' do
      subject { get :components }
      it { is_expected.to render_template(:components) }
    end

    describe '#update_components' do
      let(:ids_to_enable) do
        all_component_ids = Course::ComponentHost.components.map { |c| c.key.to_s }
        all_component_ids.sample(1 + rand(all_component_ids.count))
      end
      let(:components_params) { { enabled_component_ids: ids_to_enable } }
      subject { post :update_components, settings_effective: components_params }

      context 'enable/disable components' do
        let(:settings) do
          Instance::Settings::Effective.new(instance.reload, Course::ComponentHost)
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

        it { is_expected.to render_template(:components) }
      end
    end
  end
end
