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

    before { sign_in(user) }

    describe '#create' do
      subject do
        post :create, params: { user_role_request:
                                { role: 'instructor',
                                  organization: 'ABC',
                                  designation: 'Teacher',
                                  reason: 'To create new course' } }
      end

      context 'when a user creates a new role request' do
        it 'redirects and sets the proper success flash message' do
          subject
          is_expected.to redirect_to(courses_path)
          expect(flash[:success]).to eq(I18n.t('instance_user_role_requests.create.success'))
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
        it 'returns to the "new" page' do
          subject
          is_expected.to render_template(:new)
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
        it 'redirects and sets the proper success flash message' do
          subject
          is_expected.to redirect_to(courses_path)
          expect(flash[:success]).to eq(I18n.t('instance_user_role_requests.update.success'))
        end
      end

      context 'when a field input is invalid' do
        let(:designation) { 'Boss' * 100 }
        it 'renders "edit" page' do
          subject
          is_expected.to render_template(:edit)
        end
      end
    end

    describe '#approve' do
      before { sign_in(admin) }
      let!(:request) { create(:instance_user_role_request, :pending, instance: instance, user: user) }

      subject do
        patch :approve, params: { id: request.id,
                                  user_role_request:
                                  { role: request.role },
                                  format: 'js' }
      end

      context 'when a valid request is approved' do
        it 'updates the role of the user' do
          subject
          expect(flash[:success]).to eq(I18n.t('instance_user_role_requests.approve.success'))

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
      before { sign_in(admin) }
      let!(:request) { create(:instance_user_role_request, :pending, instance: instance, user: user) }

      subject do
        patch :reject, params: { id: request.id }
      end

      context 'when a valid request is rejected' do
        it 'does not change the role of the user' do
          subject
          expect(flash[:success]).to eq(I18n.t('instance_user_role_requests.reject.success'))

          request.reload
          expect(request.workflow_state).to eq('rejected')
          expect(request.user.instance_users.first.reload.role).to eq(user.role)

          is_expected.to redirect_to(instance_user_role_requests_path)
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
      before { sign_in(admin) }
      let!(:request) { create(:instance_user_role_request, :pending, instance: instance, user: user) }
      let(:message) { 'Please provide reason for role request' }

      subject do
        patch :reject, params: { id: request.id, user_role_request: { rejection_message: message } }
      end

      context 'when a valid request is rejected' do
        it 'does not change the role of the user' do
          subject
          expect(flash[:success]).to eq(I18n.t('instance_user_role_requests.reject.success_with_email'))

          request.reload
          expect(request.workflow_state).to eq('rejected')
          expect(request.rejection_message).to eq(message)
          expect(request.user.instance_users.first.reload.role).to eq(user.role)

          is_expected.to redirect_to(instance_user_role_requests_path)
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

          expect(flash[:danger]).to eq(I18n.t('instance_user_role_requests.reject.failure'))
          is_expected.to redirect_to(instance_user_role_requests_path)
        end
      end
    end
  end
end
