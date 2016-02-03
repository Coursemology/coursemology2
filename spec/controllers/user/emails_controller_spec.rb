# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::EmailsController, type: :controller do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    before { sign_in(user) }

    describe '#destroy' do
      subject { delete :destroy, id: user.send(:default_email_record) }

      context 'when the user only has one email address' do
        it 'cannot be deleted' do
          expect { subject }.to change { user.emails.count }.by(0)
        end
        it { is_expected.to redirect_to(user_emails_path) }
      end

      context 'when destroying a primary email' do
        let!(:non_primary_email) { create(:user_email, user: user, primary: false) }
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
      let!(:email_stub) do
        stub = create(:user_email, user: user, primary: false)
        allow(stub).to receive(:update_attributes).and_return(false)
        stub
      end
      subject { post :set_primary, id: email_stub }

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@email, email_stub)
        end
        it 'does not change the primary email' do
          subject
          expect(email_stub.reload.primary).to be_falsey
          expect(user.reload.emails.find(&:primary?)).not_to be_nil
        end

        it { is_expected.to redirect_to(user_emails_path) }
      end
    end
  end
end
