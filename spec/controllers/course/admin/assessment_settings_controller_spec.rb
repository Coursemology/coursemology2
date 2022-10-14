# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::AssessmentSettingsController, type: :controller do
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
      before do
        allow(course).to receive(:update).and_return(false)
        allow(controller).to receive(:current_course).and_return(course)
        allow(controller).to receive(:category_params).and_return(nil)
      end
      context 'upon update failure' do
        subject { patch :update, params: { course_id: course } }
        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end
  end
end
