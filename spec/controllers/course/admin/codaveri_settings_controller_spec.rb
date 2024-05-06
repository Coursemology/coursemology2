# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::CodaveriSettingsController, type: :controller do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    before { controller_sign_in(controller, user) }

    describe '#edit' do
      subject { get :edit, params: { course_id: course, format: :json } }
      it { is_expected.to render_template(:edit) }
    end

    describe '#update' do
      before do
        allow(course).to receive(:save).and_return(false)
        allow(controller).to receive(:current_course).and_return(course)
      end
      context 'when course cannot be saved' do
        subject { patch :update, params: { course_id: course, settings_codaveri_component: { is_only_itsp: '' } } }
        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end
  end
end
