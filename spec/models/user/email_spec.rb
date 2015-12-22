require 'rails_helper'

RSpec.describe User::Email, type: :model do
  it { is_expected.to belong_to(:user).inverse_of(:emails) }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:email) { build(:user_email) }

    describe 'send_confirmation_instructions' do
      it 'sends the confirmation instructions' do
        email = create(:user_email)

        expect { email.send_confirmation_instructions }.
          to change { ActionMailer::Base.deliveries.count }.by(1)
      end
    end

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
  end
end
