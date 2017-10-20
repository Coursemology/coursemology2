# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::ComponentSettingsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    before { sign_in(user) }

    describe '#edit' do
      subject { get :edit, params: { course_id: course } }
      it { is_expected.to render_template(:edit) }
    end

    describe '#update' do
      let(:ids_to_enable) do
        allow(controller).to receive(:current_course).and_return(course)
        all_components = controller.current_component_host.course_disableable_components
        all_component_ids = all_components.map { |c| c.key.to_s }
        all_component_ids.sample(1 + rand(all_component_ids.count))
      end
      let(:components_params) { { enabled_component_ids: ids_to_enable } }
      let(:settings) do
        # reset memoised result to force recomputation
        controller.current_component_host.instance_variable_set(:@enabled_components, nil)
        Course::Settings::Components.new(course.reload, controller.current_component_host)
      end

      subject do
        patch :update, settings_components: components_params, course_id: course
      end

      it 'enables the specified component and disables all other components' do
        subject
        expect(settings.enabled_component_ids.to_set).to eq(ids_to_enable.to_set)
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

      context 'when parameters are invalid' do
        let(:components_params) do
          { enabled_component_ids: ids_to_enable << 'invalid-key' }
        end

        it 'raises an error' do
          expect { subject }.to raise_exception(ArgumentError)
        end
      end
    end
  end
end
