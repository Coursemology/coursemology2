# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserEmailSubscriptionsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let!(:staff) { create(:course_teaching_assistant, course: course) }
    let!(:student) { create(:course_student, course: course) }
    let(:json_response) { JSON.parse(response.body) }

    describe '#edit html' do
      before { sign_in(staff.user) }
      subject { get :edit, params: { course_id: course, user_id: staff } }
      it { is_expected.to render_template(:edit) }
    end

    describe '#edit json' do
      before { sign_in(student.user) }
      subject do
        get :edit, format: :json, params: {
          course_id: course,
          user_id: student,
          component: 'videos',
          setting: 'closing_reminder',
          unsubscribe: true
        }
      end

      it { is_expected.to render_template(partial: '_subscription_setting') }
    end

    describe '#update' do
      before { sign_in(user) }
      subject do
        patch :update, format: :json,
                       params: { course_id: course,
                                 user_id: course.course_users.first,
                                 user_email_subscriptions: payload_email }
      end

      context 'when a user unsubscribes' do
        render_views
        let(:payload_email) do
          {
            'component' => 'users',
            'setting' => 'new_enrol_request',
            'enabled' => false
          }
        end
        before { subject }

        it 'responds with the necessary fields' do
          new_enrol_request_setting =
            json_response['settings'].find { |setting| setting['setting'] == 'new_enrol_request' }
          expect(new_enrol_request_setting['enabled']).to eq(false)
        end
      end

      context 'when a user subscribes' do
        render_views
        let(:payload_email) do
          {
            'component' => 'users',
            'setting' => 'new_enrol_request',
            'enabled' => true
          }
        end
        before do
          setting_email = course.setting_emails.where(component: 'users', setting: 'new_enrol_request').first
          course.course_users.first.email_unsubscriptions.create!(course_setting_email: setting_email)
          subject
        end

        it 'responds with the necessary fields' do
          new_enrol_request_setting =
            json_response['settings'].find { |setting| setting['setting'] == 'new_enrol_request' }
          expect(new_enrol_request_setting['enabled']).to eq(true)
        end
      end
    end
  end
end
