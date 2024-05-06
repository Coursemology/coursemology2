# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Group::GroupsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:course) { create(:course, creator: admin) }
    let(:group_category) { create(:course_group_category, course: course) }
    let(:group) { create(:course_group, group_category: group_category) }
    before { controller_sign_in(controller, admin) }

    describe '#update' do
      subject do
        patch :update, as: :json,
                       params: { course_id: course, group_category_id: group_category, id: group }.
                         reverse_merge(group_attributes)
      end

      context 'when name is present' do
        let(:group_attributes) do
          { name: 'Hello' }
        end

        it 'updates the name of the group' do
          subject
          expect(group.reload.name).to eq 'Hello'
        end
      end

      context 'when description is present' do
        let(:group_attributes) do
          { name: 'Hello', description: 'World' }
        end

        it 'updates the description of the group' do
          subject
          expect(group.reload.description).to eq 'World'
        end
      end
    end

    describe '#destroy' do
      let!(:group_stub) do
        stub = create(:course_group, group_category: group_category)
        allow(stub).to receive(:destroy).and_return(false)
        stub
      end
      subject do
        delete :destroy, as: :json, params: { course_id: course, group_category_id: group_category, id: group_stub }
      end

      context 'when the group cannot be destroyed' do
        before do
          controller.instance_variable_set(:@group, group_stub)
          subject
        end

        it { expect(response.status).to eq(400) }
      end
    end
  end
end
