# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::ComponentSettingsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    before { sign_in(user) }

    describe '#edit' do
      subject { get :edit, params: { course_id: course, format: :json } }
      it { is_expected.to render_template(:edit) }
    end

    describe '#update' do
      let(:ids_to_enable) do
        all_component_ids = course.disableable_components.map { |c| c.key.to_s }
        all_component_ids.sample(1 + rand(all_component_ids.count))
      end
      let(:components_params) { { enabled_component_ids: ids_to_enable } }
      let(:settings) { Course::Settings::Components.new(course.reload) }

      subject do
        patch :update, params: { settings_components: components_params, course_id: course, format: :json }
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
          allow(stub).to receive(:errors).and_return({})
          stub
        end

        before do
          controller.instance_variable_set(:@settings, settings_stub)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
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
    end
  end
end
