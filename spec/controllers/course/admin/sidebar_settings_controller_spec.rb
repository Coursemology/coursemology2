# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::SidebarSettingsController, type: :controller do
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
      before { controller.instance_variable_set(:@course, course) }
      let(:sample_item) { controller.sidebar_items(type: :normal).sample }
      let(:weight) { 10 }
      let(:sidebar_item_attributes) do
        id = generate(:nested_attribute_new_id)
        sidebar_item_attributes = { id => { id: sample_item[:key], weight: weight } }
        { sidebar_items_attributes: sidebar_item_attributes }
      end
      subject { patch :update, params: { settings_sidebar: sidebar_item_attributes, course_id: course } }

      context 'when the weight is greater than 0' do
        it 'updates the weight' do
          subject
          saved_weight = course.reload.settings(:sidebar, sample_item[:key]).weight
          expect(saved_weight).to eq(weight)
        end
      end

      context 'when the weight is less than 0' do
        let(:weight) { -1 }

        it 'does not update the weight' do
          subject
          saved_weight = course.reload.settings(:sidebar, sample_item[:key]).weight
          expect(saved_weight).not_to eq(weight)
        end
      end

      context 'when the weight is the heaviest' do
        let(:weight) do
          heaviest_item = controller.current_component_host.sidebar_items.
                          max_by { |item| item[:weight] }
          heaviest_item[:weight] + 1
        end

        it 'reorders the item to the bottom' do
          subject
          last_item = controller.sidebar_items(type: :normal).last
          expect(last_item[:key]).to eq(sample_item[:key])
        end
      end
    end
  end
end
