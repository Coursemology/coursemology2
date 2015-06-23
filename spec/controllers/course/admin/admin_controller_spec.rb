require 'rails_helper'

RSpec.describe Course::Admin::AdminController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    before { sign_in(user) }

    describe '#components' do
      subject { get :components, course_id: course }
      it { is_expected.to render_template(:components) }
    end

    describe '#update_components' do
      let(:ids_to_enable) do
        allow(controller).to receive(:current_course).and_return(course)
        all_components = controller.current_component_host.instance_components
        all_component_ids = all_components.map { |c| c.key.to_s }
        all_component_ids.sample(1 + rand(all_component_ids.count))
      end
      let(:components_params) { { enabled_component_ids: ids_to_enable } }
      let(:settings) { Course::Settings.new(course.reload) }

      subject do
        post :update_components, settings_effective: components_params, course_id: course
      end

      it 'enables the specified component and disables all other components' do
        subject
        expect(settings.enabled_component_ids).to eq(ids_to_enable)
      end

      context 'when course cannot be saved' do
        before do
          allow(course).to receive(:save).and_return(false)
          controller.instance_variable_set(:@course, course)
          subject
        end

        it { is_expected.to render_template(:components) }
      end
    end
  end
end
