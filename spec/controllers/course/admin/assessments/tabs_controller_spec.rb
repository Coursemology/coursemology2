# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::Assessments::TabsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course, creator: user) }
    let(:category) { create(:course_assessment_category, course: course) }
    let!(:tab_stub) do
      stub = create(:course_assessment_tab, category: category)
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub).to receive(:save).and_return(false)
      stub
    end

    before { controller_sign_in(controller, user) }

    describe '#create' do
      subject { post :create, params: { course_id: course, category_id: category } }
      context 'upon create failure' do
        before do
          controller.instance_variable_set(:@tab, tab_stub)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, category_id: category, id: tab_stub } }
      context 'upon destroy failure' do
        before do
          controller.instance_variable_set(:@tab, tab_stub)
          subject
        end

        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end
  end
end
