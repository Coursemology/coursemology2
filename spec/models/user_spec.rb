require 'rails_helper'

RSpec.describe User, type: :model do
  describe '#email' do
    let(:user) { User.new }
    it 'should not have a default email' do
      expect(user.email).to eq(nil)
    end
  end

  describe '#email=' do
    context 'when the user has no email addresses' do
      let(:user) do
        result = build(:user, emails_count: 0)
        result.email = generate(:email)
        result
      end
      it 'should create a new UserEmail' do
        expect(user.emails.length).to_not eq(0)
      end

      it 'should create a new primary UserEmail' do
        expect(user.emails[0].primary?).to eq(true)
      end

      it 'should delete the only email address when assigning nil' do
        user.email = nil
        expect(user.email).to eq(nil)

        remaining_emails = user.emails.reject { |user_email| user_email.marked_for_destruction? }
        expect(remaining_emails.length).to eq(0)
      end
    end

    context 'when the user has multiple email addresses' do
      let(:user) { build(:user, emails_count: 2) }
      context 'when there is no primary email set' do
        it 'should set the first email as primary' do
          user.email = 'test1a@email'
          email_record = user.send(:default_email_record)
          expect(email_record.primary?).to eq(true)
          expect(email_record.email).to eq('test1a@email')
        end
      end
    end

  end
end
