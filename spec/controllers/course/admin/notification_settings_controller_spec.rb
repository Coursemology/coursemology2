# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::NotificationSettingsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:json_response) { JSON.parse(response.body) }
    before { sign_in(user) }

    describe '#edit' do
      subject { get :edit, params: { course_id: course } }
      it { is_expected.to render_template(:edit) }
    end

    describe '#update' do
      subject { patch :update, params: { course_id: course, email_settings: payload_email } }

      context 'when valid parameters are received' do
        render_views
        let(:payload_email) do
          {
            'component' => 'announcements',
            'setting' => 'new_announcement',
            'regular' => 'false'
          }
        end
        before { subject }

        it 'responds with the necessary fields' do
          new_announcement_setting =
            json_response.find { |setting| setting['setting'] == 'new_announcement' }
          expect(new_announcement_setting['regular']).to eq(false)
        end
      end
    end
  end
end
