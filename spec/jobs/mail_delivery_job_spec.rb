# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ActionMailer::MailDeliveryJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:invitation) { create(:course_user_invitation, course: course) }
    let(:error) { Net::SMTPSyntaxError.new('501 Invalid RCPT TO address provided') }

    describe 'discard_on permanent SMTP errors' do
      subject do
        described_class.perform_now('Course::Mailer', 'user_invitation_email', 'deliver_now',
                                    args: [invitation])
      end

      before do
        # Stub mail delivery to raise SMTP error
        allow_any_instance_of(Mail::Message).to receive(:deliver).and_raise(error)
      end

      it 'calls mark_email_as_invalid on the invitation record' do
        expect(invitation).to receive(:mark_email_as_invalid).with(error).and_call_original
        subject
      end

      it 'marks the invitation as not retryable' do
        expect { subject }.to change { invitation.reload.is_retryable }.from(true).to(false)
      end

      it 'does not raise the error' do
        expect { subject }.not_to raise_error
      end

      context 'with Net::SMTPFatalError' do
        let(:error) { Net::SMTPFatalError.new('550 User not found') }

        it 'calls mark_email_as_invalid on the invitation record' do
          expect(invitation).to receive(:mark_email_as_invalid).with(error).and_call_original
          subject
        end

        it 'marks the invitation as not retryable' do
          expect { subject }.to change { invitation.reload.is_retryable }.from(true).to(false)
        end
      end

      context 'with Net::SMTPAuthenticationError' do
        let(:error) { Net::SMTPAuthenticationError.new('535 Authentication failed') }

        it 'calls mark_email_as_invalid on the invitation record' do
          expect(invitation).to receive(:mark_email_as_invalid).with(error).and_call_original
          subject
        end

        it 'marks the invitation as not retryable' do
          expect { subject }.to change { invitation.reload.is_retryable }.from(true).to(false)
        end
      end

      context 'with Net::SMTPServerBusy (transient error)' do
        let(:error) { Net::SMTPServerBusy.new('421 Try again later') }

        it 'does not discard the job' do
          expect(invitation).not_to receive(:mark_email_as_invalid)
          expect { subject }.to raise_error(Net::SMTPServerBusy)
          expect(invitation.reload.is_retryable).to be true
        end
      end
    end
  end
end
