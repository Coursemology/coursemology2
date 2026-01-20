# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::EmailsController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    before { controller_sign_in(controller, user) }

    describe '#destroy' do
      subject { delete :destroy, as: :json, params: { id: user.send(:default_email_record) } }

      context 'when the user only has one email address' do
        it 'cannot be deleted' do
          expect { subject }.to change { user.emails.count }.by(0)
        end
        it { is_expected.to have_http_status(:bad_request) }
      end

      context 'when destroying a primary email' do
        let!(:non_primary_email) { create(:user_email, user: user, primary: false) }
        before { controller_sign_in(controller, user) }

        it 'deletes the primary email' do
          expect { subject }.to change { user.emails.count }.by(-1)
        end

        it 'sets another email as primary' do
          subject
          expect(non_primary_email.reload).to be_primary
        end
      end
    end

    describe '#set_primary' do
      let(:email) { create(:user_email, :unconfirmed, user: user, primary: false) }
      subject { post :set_primary, params: { id: email }, format: :json }

      context 'when email is not confirmed' do
        it 'does not change the primary email' do
          subject
          expect(email.reload.primary).to be_falsey
          expect(user.reload.emails.find(&:primary?)).not_to be_nil
        end

        it { is_expected.to have_http_status(:ok) }
      end
    end

    describe '#send_confirmation', type: :mailer do
      let!(:email) { create(:user_email, email_traits, user: user, primary: false) }
      subject { post :send_confirmation, params: { id: email } }

      context 'when the email is already confirmed' do
        let(:email_traits) { :confirmed }

        it 'does not send any confirmations' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        it 'sets an error message' do
          subject

          json_result = JSON.parse(response.body)
          expect(json_result['errors']).to eq(I18n.t('errors.user.emails.already_confirmed', email: email.email))
        end
      end

      context 'when the email is not confirmed' do
        let(:email_traits) { :unconfirmed }

        with_active_job_queue_adapter(:test) do
          it 'sends out a confirmation email' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
          end
        end

        it { is_expected.to have_http_status(:ok) }
      end
    end
  end
end
