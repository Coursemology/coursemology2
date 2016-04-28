# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::Email, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:emails) }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:email) { build(:user_email) }
    it 'rejects invalid email addresses' do
      email.email = 'wrong'
      expect(email.valid?).to eq(false)
    end

    context 'when a user has multiple emails' do
      let(:user) { create(:user) }
      let(:primary_email) { user.emails.first }
      let!(:non_primary_email) { create(:user_email, user: user, primary: false) }

      context 'when unset a primary email' do
        subject { primary_email }
        before { primary_email.primary = false }

        it { is_expected.to be_valid }
      end

      context 'when set the other email as primary' do
        subject { non_primary_email }
        before { non_primary_email.primary = true }

        it { is_expected.not_to be_valid }
      end
    end

    context 'when email has already been taken' do
      let(:existing_email) { create(:user_email).email }
      subject { build(:user_email, email: existing_email) }

      it 'is not valid' do
        expect(subject).not_to be_valid
        expect(subject.errors[:email].count).to eq(1)
      end
    end

    context 'when the email is not confirmed' do
      subject { create(:user_email, :unconfirmed) }

      with_active_job_queue_adapter(:test) do
        it 'sends email with ActiveJob queue' do
          expect { subject }.to have_enqueued_job.on_queue('mailers')
        end
      end
    end
  end
end
