# frozen_string_literal: true
require 'rails_helper'

RSpec.describe InstanceUserRoleRequestsController, type: :controller do
  let(:instance) { Instance.default }
  let(:admin) { instance.users.where(role: :administrator).first }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:immutable_request) do
      create(:instance_user_role_request, :pending, instance: instance, user: user).tap do |stub|
        allow(stub).to receive(:update).and_return(false)
      end
    end

    before { controller_sign_in(controller, user) }

    describe '#create' do
      subject do
        post :create, params: { user_role_request:
                                { role: 'instructor',
                                  organization: 'ABC',
                                  designation: 'Teacher',
                                  reason: 'To create new course' } }
      end

      context 'when a user creates a new role request' do
        it 'returns the correct JSON response' do
          subject
          is_expected.to have_http_status(:ok)
          expect(JSON.parse(response.body)).to have_key('id')
        end

        it 'sends an email notification to the admin', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)

          expect(emails).to include(admin.email)
          expect(email_subjects).to include('instance_user_role_request_mailer.new_role_request.subject')
        end
      end

      context 'there is an existing request' do
        let!(:request) { create(:instance_user_role_request, :pending, instance: instance, user: user) }
        it 'returns bad request header with the correct error message' do
          subject
          is_expected.to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors][:base]).to include(I18n.t('activerecord.errors.models.'\
                                                                  'instance/user_role_request.attributes.'\
                                                                  'base.existing_pending_request'))
        end
      end
    end

    describe '#update' do
      let(:designation) { 'Boss' }
      let!(:request) { create(:instance_user_role_request, :pending, instance: instance, user: user) }
      subject do
        patch :update, params: { id: request,
                                 user_role_request:
                                  { role: :administrator,
                                    organization: 'ABC Firesale',
                                    designation: designation,
                                    reason: 'To make pratha' } }
      end

      context 'when a user updates an existing role request' do
        it 'returns the correct JSON response' do
          subject
          is_expected.to have_http_status(:ok)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:id]).to eq(request.id)
        end
      end

      context 'when a field input is invalid' do
        let(:designation) { 'Boss' * 100 }
        it 'returns bad request header with the correct error message' do
          subject
          is_expected.to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors][:designation]).to include('is too long (maximum is 255 characters)')
        end
      end
    end

    describe '#approve' do
      before { controller_sign_in(controller, admin) }
      let!(:request) { create(:instance_user_role_request, :pending, instance: instance, user: user) }

      subject do
        patch :approve, params: { id: request.id,
                                  user_role_request: { role: request.role },
                                  format: 'json' }
      end

      context 'when a valid request is approved' do
        it 'succeeds and updates the role of the user' do
          subject
          expect(subject).to have_http_status(:ok)

          expect(request.user.instance_users.first.reload.role).to eq(request.role)
          expect(request.reload.workflow_state).to eq('approved')
        end

        it 'sends an approval email notification', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)

          expect(ActionMailer::Base.deliveries.count).to eq(1)
          expect(emails).to include(user.email)
          expect(email_subjects).to include('instance_user_role_request_mailer.role_request_approved.subject')
        end
      end
    end

    describe '#reject (without message)' do
      before { controller_sign_in(controller, admin) }
      let!(:request) { create(:instance_user_role_request, :pending, instance: instance, user: user) }

      subject do
        patch :reject, format: :json, params: { id: request.id }
      end

      context 'when a valid request is rejected' do
        it 'does not change the role of the user' do
          subject
          expect(subject).to have_http_status(:ok)

          request.reload
          expect(request.workflow_state).to eq('rejected')
          expect(request.user.instance_users.first.reload.role).to eq(user.role)
        end

        it 'sends a rejection email', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)
          email_body = ActionMailer::Base.deliveries.first.
                       body.parts.find { |part| part.content_type.start_with?('text/html') }.to_s

          expect(ActionMailer::Base.deliveries.count).to eq(1)
          expect(emails).to include(user.email)
          expect(email_subjects).to include('instance_user_role_request_mailer.role_request_rejected.subject')
          expect(email_body).to include('instance_user_role_request_mailer.role_request_rejected.message_empty')
        end
      end
    end

    describe '#reject (with message)' do
      before { controller_sign_in(controller, admin) }
      let!(:request) { create(:instance_user_role_request, :pending, instance: instance, user: user) }
      let(:message) { 'Please provide reason for role request' }

      subject do
        patch :reject, format: :json, params: { id: request.id, user_role_request: { rejection_message: message } }
      end

      context 'when a valid request is rejected' do
        it 'does not change the role of the user' do
          expect(subject).to have_http_status(:ok)

          request.reload
          expect(request.workflow_state).to eq('rejected')
          expect(request.rejection_message).to eq(message)
          expect(request.user.instance_users.first.reload.role).to eq(user.role)
        end

        it 'sends a rejection email with the message', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)
          email_body = ActionMailer::Base.deliveries.
                       first.body.parts.find { |part| part.content_type.start_with?('text/html') }.to_s

          expect(ActionMailer::Base.deliveries.count).to eq(1)
          expect(emails).to include(user.email)
          expect(email_subjects).to include('instance_user_role_request_mailer.role_request_rejected.subject')
          expect(email_body).to include('instance_user_role_request_mailer.role_request_rejected.message')
        end
      end

      context 'when a valid request is failed to be rejected' do
        before do
          controller.instance_variable_set(:@user_role_request, request)
        end

        let(:request) { immutable_request }

        it 'fails to reject the request' do
          subject
          expect(subject).to have_http_status(:bad_request)
        end
      end
    end
  end
end
